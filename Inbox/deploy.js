const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const { interface, bytecode } = require("./compile");

const provider = new HDWalletProvider(
	"title camera mention aware angry trim bullet comfort unique become kick favorite",
	"https://rinkeby.infura.io/v3/3cf9d7a7bcd64ec6adeda5bc262b0744"
);

const web3 = new Web3(provider);

const deploy = async () => {
	const accounts = await web3.eth.getAccounts();
	console.log("Attempting to deploy from account", accounts[0]);

	const result = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({
			data: bytecode,
			arguments: ["Hi there!"],
		})
		.send({ from: accounts[0], gas: "1000000" });

	console.log("Contract deployed to", result.options.address);
};

deploy();
provider.engine.stop();
