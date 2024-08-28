export enum WebsocketEvents {
    REQUEST = 'newRequest',
    REQUEST_ACCEPTED = 'requestAccepted',
    REQUEST_REJECTED = 'requestRejected',

    MESSAGE = 'newMessage',
    MESSAGE_VIEWED = 'messageViewed',

    CHAT = 'newChat',
    CHAT_REMOVED = 'chatRemoved',

    ORDER = 'newOrder',
    ORDER_PAID = 'orderPaid',
}
