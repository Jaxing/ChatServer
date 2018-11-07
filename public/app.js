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
        channels: {'sup': [], 'hej': []}
    },
    created: function() {
        var self = this;
        this.ws = new WebSocket('ws://' + window.location.host + '/ws');
        this.messages = []
        this.ws.addEventListener('message', function(e) {
            var msg = JSON.parse(e.data);
            msg.message = emojione.toImage(msg.message);
            msg.email = self.gravatarURL(msg.email);
            self.channels[msg.channel].push(msg);
            console.debug("message recived: " + msg.message + msg.email + msg.username);
            console.log(self.channels[self.channel].length);
            var element = document.getElementById('chat-messages');
            element.scrollTop = element.scrollHeight; // Auto scroll to the bottom
        });
    },
    methods: {
        send: function () {
            if (this.newMsg != '') {
                var msg = JSON.stringify({
                    channel: this.channel,
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
        },
        changeChannel: function (newChannel) {
            if (newChannel != this.channel) {
                this.channel = newChannel
                console.debug(this.username + " switched to " + this.channel)
                this.ws.send(
                    JSON.stringify({
                        email: this.email,
                        username: this.username,
                        message: $('<i>').html(this.username + "joined").text(), // Strip out 
                        channel: this.channel
                    }
                ));
            }
        },
        gravatarURL: function(email) {
            return 'http://www.gravatar.com/avatar/' + CryptoJS.MD5(email);
        }
    }
});