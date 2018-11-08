new Vue({
    el: '#app',

    data: {
        ws: null, // Our websocket
        newMsg: '', // Holds new messages to be sent to the server
        //chatContent: '', // A running list of chat messages displayed on the screen
        email: null, // Email address used for grabbing an avatar
        username: null, // Our username
        joined: false, // True if email and username have been filled in
        channel: 'sup',
        channels: ['sup', 'hej'],
        messages: []
    },
    created: function() {
        var self = this;
        this.ws = new WebSocket('ws://' + window.location.host + '/ws');
        this.ws.addEventListener('message', function(e) {
            var messages = JSON.parse(e.data);
            self.messages = []
            for (i = 0; i < messages.length; i++) {
                var msg = messages[i];
                msg.message = emojione.toImage(msg.message);
                msg.email = self.gravatarURL(msg.email);
                self.messages.push(msg)
            }
            console.log(self.messages)
            var element = document.getElementById('chat-messages');
            element.scrollTop = element.scrollHeight; // Auto scroll to the bottom
        });
    },
    methods: {
        send: function () {
            if (this.newMsg != '') {
                var msg = JSON.stringify({
                    channel: this.channel,
                    channels: this.channels,
                    email: this.email,
                    username: this.username,
                    message: $('<p>').html(this.newMsg).text() // Strip out html
                });
                console.debug("Message sent: " + msg)
                this.ws.send(msg);
                this.newMsg = ''; // Reset newMsg
            }
        },
        join: function () {
            if (!this.email) {
                Materialize.toast('You must enter an email', 2000);
                return
            }
            if (!this.username) {
                Materialize.toast('You must choose a username', 2000);
                return
            }
            this.email = $('<p>').html(this.email).text();
            this.username = $('<p>').html(this.username).text();
            this.joined = true;
            this.sendChatInfo(this.username + " joined")
        },
        changeChannel: function (newChannel) {
            if (newChannel != this.channel) {
                this.channel = newChannel
                if (!this.channels.includes(this.channel)) {
                    this.channels.push(this.channel)
                } 
                console.debug(this.username + " switched to " + this.channel);
                this.messages = []
                //TODO: send request for getting messeges of channel.
            }
        },
        sendChatInfo: function (text) {
            var msg = JSON.stringify({
                channel: this.channel,
                channels: this.channels,
                email: "ChatBot",
                username: "ChatBot",
                message: $('<p>').html(text).text() // Strip out html
            });
            this.ws.send(msg);
        },
        gravatarURL: function(email) {
            return 'http://www.gravatar.com/avatar/' + CryptoJS.MD5(email);
        }
    }
});