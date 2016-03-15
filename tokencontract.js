
contract owned {
    //Define o dono do contrato (Pode ser utilizado no próximo contrato)
    address public owner;
    
    function owned(){
        owner = msg.sender;
    }
    
    modifier onlyOwner {
        if (msg.sender != owner) throw;
        _
    }
    
    //Transferir o contrato de dono
    function transferOwnership(address newOwner) onlyOwner{
        owner = newOwner;
    }
    
}


contract FainaCoin is owned{
    
    
    //Eventos que são declarados podem ser observados por entidades de fora

    //Transferência
    event Transfer(address indexed from, address indexed to, uint256 value);
    //Congelar os fundos
    event FrozenFunds(address target, bool frozen);
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public sellPrice;
    uint256 public buyPrice;
    // uint currentChallenge = 1;  //Desafio matemático da alternativa fora de proof of work
    bytes32 public currentChallenge;        //A moeda começa com um desafio
    uint public timeOfLastProof;        //Variável para seguir quando as recompensas foram dadas
     uint public difficulty = 10**32;    //Dificuldade começa rasoavelmente baixa


    /*Cria um array com todos os balanços balanceOf*/
    mapping (address => uint256) public balanceOf;
    //Cria um endereço de um dado booleano
    mapping (address => bool) public frozenAccount;
    
    function FainaCoin(uint256 initialSupply, string tokenName, uint8 decimalUnits, string tokenSymbol, address centralMinter) {
                
                timeOfLastProof = now;    //ajuste de dificuldade

                if (centralMinter != 0) owner = msg.sender;
                if (initialSupply == 0) initialSupply = 42000000;     //se o numero de moedas não for dado gerar 42 milhões
        balanceOf[msg.sender] = initialSupply;                //dar para o criador todas os tokens gerados
        name = tokenName;                                    //setar o nome para display
        symbol = tokenSymbol;                            //setar o simbolo para propósitos de display
        decimals = decimalUnits;                //numero de casas decimais para display
    }
    




    /*Função para enviar moedas */
    function transfer(address _to, uint256 _value){
          //Checa se a conta esta congelada
          if (!frozenAccount[msg.sender]) throw;

        /*Checa se o remetente possui balanço suficiente e para*/
        if (balanceOf[msg.sender] < _value || balanceOf[_to] + _value < balanceOf[_to])
        throw;
        
        /*Adicionar e subtrair novos balanços*/
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        
        
    //Notificar qualquer um escutando que essa transferencia ocorreu
    Transfer(msg.sender, _to, _value);


    }


//setar os preços do mercado
function setPrices(uint256 newSellPrice, uint256 newBuyPrice) onlyOwner {
    sellPrice = newSellPrice;
    buyPrice = newBuyPrice;
}


    function buy() {

uint amount = msg.value / buyPrice;      //Calcula o montante
if (balanceOf[this] < amount) throw;    //Checa se tem o suficiente para a venda
balanceOf[msg.sender] += amount;        //Soma o montante no saldo de quem enviou a mensagem
balanceOf[this] -= amount;               //Subtrai o valor de quem vendeu
Transfer(this, msg.sender, amount);        //Executa um evento que reflete a transação

    }


    function sell(uint amount) {
        if (balanceOf[msg.sender] < amount) throw;        //Calcula se o remetente possui saldo suficiente
        balanceOf[this] += amount;                        //Aumenta o saldo do comprador
        balanceOf[msg.sender] -= amount;                //Diminui o saldo do vendedor
        msg.sender.send(amount * sellPrice);            //Envia ether para o vendedor
        Transfer(msg.sender, this, amount);                //Executa um evento que reflete a transação

    }


    function giveBlockReward() {
        balanceOf[block.coinbase] += 1;                //Coinbase é uma palavra especial que refere 
    //ao minerador que acha um bloco na rede ethereum.
    //porque seria um "merged mining" com ether
    }

/*    
        UTILIZAR AO INVÉS DO PROOF OF WORK
function rewardMathGeniuses(uint answerToCurrentReward, uint nextChallenge) {
        if (answerToCurrentReward**3 != currentChallenge) throw;  //Se a resposta estiver errada pare
        balanceOf[msg.sender] += 1;         //Recompensa o jogador
        currentChallenge = nextChallenge;     //Seta o próximo desafio
    } */



    function proofOfWork(uint nonce){
        bytes8 n = bytes8(sha3(nonce, currentChallenge));  //Gera um hash aleatório baseado no input
        if (n < bytes8(difficulty)) throw;   //Verifica se esta abaixo da dificuldade
        
        uint timeSinceLastProof = (now - timeOfLastProof); //Calcula o tempo desde a ultima recompensa
        if (timeSinceLastProof < 5 seconds) throw;    //Recompensas não podem ser distribuídas muito rapidemente
        balanceOf[msg.sender] += timeSinceLastProof / 60 seconds;  //A recompensa do ganhador cresce por minuto

        difficulty = difficulty * 10 minutes / timeSinceLastProof + 1;  //Reajusta a dificuldade

        timeOfLastProof = now;    //Reseta o contador
        currentChallenge = sha3(nonce, currentChallenge, block.blockhash(block.number-1));  //Salva o hash que será usado como próxima prova

    }






    //Congelar uma conta
    function freezeAccount(address target, bool freeze) onlyOwner {
        frozenAccount[target] = freeze;

        FrozenFunds(target, freeze);
    }


    //Criar novas moedas
    function mintToken(address target, uint256 mintedAmount) onlyOwner {
        balanceOf[target] += mintedAmount;
        Transfer(0, target, mintedAmount);
    }
    
}

