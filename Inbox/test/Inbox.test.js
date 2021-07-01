const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require("../compile");

let accounts;
let inbox;
let INITIAL_MESSAGE = "Hi there!";
let UPDATED_MESSAGE = "bye!";

beforeEach(async () => {
	// Get list of all accounts
	accounts = await web3.eth.getAccounts();

	// Use one of those accounts to deploy
	// the contract
	inbox = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({
			data: bytecode,
			arguments: [INITIAL_MESSAGE],
		})
		.send({ from: accounts[0], gas: "1000000" });
});

describe("Inbox", () => {
	it("deploys a contract", () => {
		assert.ok(inbox.options.address);
	});

	it("has default message", async () => {
		const message = await inbox.methods.message().call();
		assert.strictEqual(message, INITIAL_MESSAGE);
	});

	it("can change message", async () => {
		await inbox.methods.setMessage(UPDATED_MESSAGE).send({ from: accounts[0] });
		const message = await inbox.methods.message().call();
		assert.strictEqual(message, UPDATED_MESSAGE);
	});
});
