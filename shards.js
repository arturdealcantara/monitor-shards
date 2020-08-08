/* Monitor Status de Shards - Discord Bots 
*
* Dev: GM#3078 (arturdealcantara)
* Propósito: Mostrar o status dos shards separadamente, tendo em vista saber através do ID, tempo de execução, memória Ram usada, ping, quantidade de usuários e guilds.
* OBS.: A tabela suporta apenas 6 colunas.
* Outros.: Foi desenvolvido para o ZabbiX, um excelente bot para discord.
* Informações adicionais: Me procura no meu servidor, link na bio do Github.
*/

// Package usado para criar a TABELA "npm i ascii-table".
const AsciiTable = require('ascii-table'),
	// Defina um título se quiser, se não, deixe vazio ().
	table = new AsciiTable('ZabbiX Shards'),
	unit = ['', 'K', 'M', 'G', 'T', 'P']

module.exports.run = async (client, message) => {

	/* 
	* Título da COLUNA;
	* São suportados 6 colunas por tabela;
	* Se quiser, pode por paginação.
	*/
	table.setHeading('SID', 'UpTime', 'Ping', 'Usage', 'Guilds', 'Users')

	// Necessário para centralizar o Row na tabela
	table.setAlign(0, AsciiTable.CENTER)
	table.setAlign(1, AsciiTable.CENTER)
	table.setAlign(2, AsciiTable.CENTER)
	table.setAlign(3, AsciiTable.CENTER)
	table.setAlign(4, AsciiTable.CENTER)
	table.setAlign(5, AsciiTable.CENTER)

	// Não é necessário essa próxima linha, a tabela já vem pronta.
	table.setBorder('|', '-', '+', '+')

	// Busca por algumas informações, para preencher a tabela.
	const uptime = await client.shard.broadcastEval('this.uptime'),
		ping = await client.shard.broadcastEval('Math.round(this.ws.ping)'),
		ram = await client.shard.broadcastEval(`process.memoryUsage().rss`),
		guilds = await client.shard.fetchClientValues('guilds.cache.size'),
		channels = await client.shard.fetchClientValues('channels.cache.size'),

		// Note que não fiz o tratamento de remover os bots da contagem, no caso é o total de usuários + bots.
		users = await client.shard.fetchClientValues('users.cache.size')

	/* 
	* Para que seja criado os Rows (linhas da tabela), é necessário o FOR, passando o parâmetro com o máx '< (menor que) shardCount'.
	* Para que crie exatamente a quantidade correta de Rows.
	*/
	for (let i = 0; i < client.options.shardCount; i++) {

		// Cada coluna é preenchida com uma informação, então cada informação deve estar no lugar correto, pode separar as colunas por ',' (vírgula).
		table.addRow(i, client.util.parseDur(uptime[i]), '~' + Math.round(ping[i]) + 'ms', bytesToSize(ram[i], 2), guilds[i].toLocaleString('pt-BR'), users[i].toLocaleString('pt-BR'))
	}

	//O reduce busca reduzir um array. Ele iterará por cada elemento dessa lista com o objetivo de ao final gerar um único valor.
	const botGuilds = guilds.reduce((prev, val) => prev + val),
		botUsers = users.reduce((prev, val) => prev + val),
		ramTotal = ram.reduce((prev, val) => prev + val),
		ping_media = ping.reduce((prev, val) => prev + val),
		media = ping_media / client.options.shardCount
	// Aqui definimos um Row vazio ou complementado por algum simbolo.
	table.addRow('______', '______', '______', '______', '______', '______')

	// Essa é a última linha da TABELA, então seria o resultado da soma ou média dos valores mostrados las linhas anteriores.
	table.addRow('TOTAL', '-', '~' + Math.round(media) + 'ms', bytesToSize(ramTotal, 2), botGuilds.toLocaleString('pt-BR'), botUsers.toLocaleString('pt-BR'))

	/* 
	*Essa parte é a mais esperada, que envia de fato a TABELA, no canal onde foi usado o comando. 
	*NOTA: "Eu particularmente, tentei por em embed, não funciona bem, fica quebrado."
	* O "prolog", nada mais é que um Markdown (Markdown é uma linguagem simples de marcação originalmente criada por John Gruber e Aaron Swartz. Markdown converte seu texto em HTML válido)  
	*/
	message.channel.send(`\`\`\`prolog
${table.toString()}\`\`\``)

	// É necessário limpar os Rows, sempre, depois de usar o comando, caso não limpe, as informações ficam se sobrepondo.
	table.clearRows()
}

// Arrow Function que converterá os Byts usados em "KB (Kilobytes), MB (Megabyte), GB (Gigabyte), TB (Terabyte), PB (Petabyte)"
let bytesToSize = (input, precision) => {

	let index = Math.floor(Math.log(input) / Math.log(1024))
	if (unit >= unit.length) return input + 'B'
	return (input / Math.pow(1024, index)).toFixed(precision) + ' ' + unit[index] + 'B'
}
