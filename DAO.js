contract owned {
	address public owner;

	function owned() {
		owner = msg.sender;
	}

	modifier onlyOwner {
		if (msg.sender != owner) throw;
		_
	}

	function transferOwnership(address newOwner) onlyOwner {
		owner = newOwner;
	}
}

contract Congress is owned {
	//Variaveis do contrato e dos eventos
	uint public minimumQuorum;
	uint public debatingPeriodInMinutes;

}