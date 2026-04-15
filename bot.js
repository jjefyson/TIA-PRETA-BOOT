const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Armazenamento simples de contatos (em produção, use um banco de dados)
const contacts = new Map();

// Função para simular digitação (corrigida)
async function simulateTyping(chat, duration = 2000) {
    await chat.sendStateTyping();
    await new Promise(resolve => setTimeout(resolve, duration));
    await chat.sendStateTyping(false);
}

// Evento quando o cliente está pronto
client.on('ready', () => {
    console.log('✅ Bot WhatsApp da Tia Preta Lanches está OK e conectado!');
});

// Evento para reconexão automática
client.on('disconnected', (reason) => {
    console.log('⚠️ Desconectado:', reason);
    setTimeout(() => {
        console.log('🔄 Tentando reconectar...');
        client.initialize();
    }, 5000);
});

// Evento para QR Code
client.on('qr', (qr) => {
    console.log('📱 QR Code gerado. Escaneie com o WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Evento para mensagens
client.on('message', async (message) => {
    const chat = await message.getChat();
    const contact = await message.getContact();
    const sender = contact.pushname || contact.number;

    // Ignorar mensagens de grupos
    if (chat.isGroup) {
        return;
    }

    // Salvar contato
    if (!contacts.has(contact.id._serialized)) {
        contacts.set(contact.id._serialized, { name: sender, number: contact.number });
        console.log(`📇 Novo contato salvo: ${sender} - ${contact.number}`);
    }

    const msg = message.body.toLowerCase().trim();

    // Saudação personalizada
    let greeting = `Olá, ${sender}! 👋 Bem-vindo à *Tia Preta Lanches*!\n\n`;

    // Menu inicial ou opção 1: Enviar link para a página web
    if (msg === 'oi' || msg === 'olá' || msg === 'ola' || msg === 'menu' || msg === '1' || msg === 'cardapio') {
        await simulateTyping(chat);
        const linkMessage = `${greeting}🍔 Confira nosso **cardápio online** e faça seu pedido:\n🔗 https://tia-preta-site.vercel.app\n\n*Opções:*\n1️⃣ Cardápio\n2️⃣ Suporte\n3️⃣ PIX`;
        await client.sendMessage(message.from, linkMessage);
    }
    // Opção 2: Suporte
    else if (msg === '2' || msg === 'suporte') {
        await simulateTyping(chat);
        const supportMessage = `${greeting}📞 *Suporte:* (75) 99975-8755`;
        await client.sendMessage(message.from, supportMessage);
    }
    // Opção 3: PIX
    else if (msg === '3' || msg === 'pix') {
        await simulateTyping(chat);
        const pixMessage = `${greeting}💰 *PIX:* 04180417502 \n\n*Envie comprovante para iniciar o pedido!*`;
        await client.sendMessage(message.from, pixMessage);
    }
    // Mensagem padrão
    else {
        await simulateTyping(chat);
        const defaultMessage = `${greeting}❓ Opção inválida. Digite:\n\n1️⃣ Cardápio\n2️⃣ Suporte\n3️⃣ PIX`;
        await client.sendMessage(message.from, defaultMessage);
    }
});

// Inicializar o cliente
client.initialize();