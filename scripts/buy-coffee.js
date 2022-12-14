// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat")

// Returns the Ethere balance of a given address.
async function getBalance(address) {
  const balanceBigInt = await hre.ethers.provider.getBalance(address)
  return hre.ethers.utils.formatEther(balanceBigInt)
}

// Logs the ether balances for a list of addresses
async function printBalances(addresses) {
  let idx = 0
  for (const address of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(address))
    idx++
  }
}

// Logs the memos stored on-chain form coffee purchases.
async function printMemos(memos) {
  for (const memo of memos) {
    const timestamp = memo.timestamp
    const tipper = memo.name
    const tipperAddress = memo.from
    const message = memo.message
    console.log(`At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`)
  }
}

async function main() {
  //GEt example accounts
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners()

  // Get the contract to deploy
  const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee")
  const buyMeACoffee = await BuyMeACoffee.deploy()
  await buyMeACoffee.deployed()
  console.log("BuyMeACoffee deployed to ", buyMeACoffee.address)

  // Check balances before the coffee purchase.
  const address = [owner.address, tipper.address, buyMeACoffee.address]
  // You can display all tipper address here
  // const address = [owner.address, tipper.address, tipper2.address, tipper3.address, buyMeACoffee.address]
  console.log("===start===")
  await printBalances(address)

  // Buy the owner a few coffees.

  const tip = { value: hre.ethers.utils.parseEther("1") }
  await buyMeACoffee.connect(tipper).buyCoffee("Carolina", "You're the best!", tip)
  await buyMeACoffee.connect(tipper2).buyCoffee("Victor", "Amazing teacher : ", tip)
  await buyMeACoffee.connect(tipper3).buyCoffee("Kay", "I Love my proof of Knowledge", tip)

  // Check balances after coffee purchase.
  console.log("=== Bought Coffee ===")
  await printBalances(address)

  //change withdraw address to tipper
  console.log("=== ChangeAddress ===")
  await buyMeACoffee.connect(owner).changeAddress(tipper.address, tip)

  //You can add directly the address lik this
  // await buyMeACoffee.connect(owner).changeAddress("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", tip)

  // Withdraw funds.

  await buyMeACoffee.connect(owner).withdrawTips()

  // Check balance after withdraw.
  console.log("=== Withdraw Tips ===")
  await printBalances(address)

  // Read all the memos left for the owner.

  console.log("=== Memos ===")
  const memos = await buyMeACoffee.getMemos()
  await printMemos(memos)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
