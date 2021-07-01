const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require("../compile");

let lottery;
let accounts;

beforeEach(async () => {
	accounts = await web3.eth.getAccounts();

	lottery = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({ data: bytecode })
		.send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery Contract", () => {
	it("deploy contract", () => {
		assert.ok(lottery.options.address);
	});

	it("enter one account", async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei("0.02", "ether"),
		});

		const players = await lottery.methods.getPlayers().call({
			from: accounts[0],
		});

		assert.strictEqual(accounts[0], players[0]);
		assert.strictEqual(1, players.length);
	});

	it("enter multiple accounts", async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei("0.5", "ether"),
		});

		await lottery.methods.enter().send({
			from: accounts[1],
			value: web3.utils.toWei("0.5", "ether"),
		});

		await lottery.methods.enter().send({
			from: accounts[2],
			value: web3.utils.toWei("1.0", "ether"),
		});

		const players = await lottery.methods.getPlayers().call({
			from: accounts[0],
		});

		assert.strictEqual(accounts[0], players[0]);
		assert.strictEqual(accounts[1], players[1]);
		assert.strictEqual(accounts[2], players[2]);
		assert.strictEqual(3, players.length);
	});

	it("requires minimum value of ether", async () => {
		try {
			await lottery.methods.enter().send({
				from: accounts[0],
				value: 0, // does this break if > 0.01 ether?
			});
			assert(false);
		} catch (err) {
			assert(err);
		}
	});

	it("only manager can pick winner", async () => {
		try {
			await lottery.methods.pickWinner().send({
				from: accounts[1],
			});
			assert(false);
		} catch (err) {
			assert(err);
		}
	});

	it("send ether to winner & reset players", async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei("2.0", "ether"),
		});

		const initialBalance = await web3.eth.getBalance(accounts[0]);

		await lottery.methods.pickWinner().send({
			from: accounts[0],
		});

		const finalBalance = await web3.eth.getBalance(accounts[0]);
		const balanceDifference = finalBalance - initialBalance;
		assert(balanceDifference > web3.utils.toWei("1.9", "ether"));

		const players = await lottery.methods.getPlayers().call({
			from: accounts[0],
		});
		assert.strictEqual(0, players.length);
	});
});
