const server = require("express")()
const line = require("@line/bot-sdk")
const dialogflow = require("apiai-promisified")

const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
}

const bot = new line.Client(line_config)
const nlu = new dialogflow(process.env.DIALOGFLOW_CLIENT_ACCESS_TOKEN, {language: "ja"})

server.listen(process.env.PORT || 3000)

server.post('/webhook', line.middleware(line_config), (req, res, next) => {
    res.sendStatus(200)
    let events_processed = []

    req.body.events.forEach((event) => {
      if (event.type == "message" && event.message.type == "text"){
        events_processed.push(
          nlu.textRequest(event.message.text, {sessionId: event.userId})
             .then((res) => {
               console.log(res.result);
                if (res.result && res.result.action == "handle-delivery-order"){
                  let message
                  if (res.result.parameters.menu && res.result.parameters.menu !== ""){
                    message = {
                      type: "text",
                      text: "毎度!${res.result.parameters.menu}ね。どちらにお届けしましょう?"
                    }
                  } else {
                    message = {
                      type: "text",
                      text: `毎度！ご注文は？`
                    }
                  }
                  return bot.replyMessage(event.replyToken, message)
                }
             })
        )
      }
    })
})
