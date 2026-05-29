import { useState, useCallback } from 'react'
import { sendChatMessage } from '../services/api'

const makeId=()=>Date.now()+Math.random()

const now=()=>new Date().toLocaleTimeString(
'fr-FR',
{
hour:'2-digit',
minute:'2-digit'
})

export function useChat(onGeoResults){

const [messages,setMessages]=useState([])

const [loading,setLoading]=useState(false)

const [error,setError]=useState(null)


const createNewChat=()=>{

setMessages([])

}


const saveChat=(userText,newMessages)=>{

let history=

JSON.parse(
localStorage.getItem(
'chatHistory'
)
)||[]


const existingChat=history.find(
chat=>chat.title===userText
)

if(existingChat){

existingChat.messages=newMessages

}else{

history.unshift({

id:Date.now(),

title:
userText.length>30
?
userText.substring(0,30)+'...'
:
userText,

messages:newMessages,

date:new Date()

})

}

localStorage.setItem(

'chatHistory',

JSON.stringify(history)

)

}



const sendMessage=useCallback(

async(text)=>{

if(!text.trim()||loading)
return

setError(null)

const userMsg={

id:makeId(),

role:'user',

text,

time:now()

}

setMessages(prev=>{

const updated=[...prev,userMsg]

return updated

})

setLoading(true)

try{

const data=

await sendChatMessage(text)

let responseText=

data.text||

'Pas de réponse'


responseText=responseText

.replace(/```json/g,'')

.replace(/```/g,'')

.trim()


try{

const parsed=

JSON.parse(responseText)

if(parsed.text)

responseText=

parsed.text

}catch{

const match=

responseText.match(

/"text"\s*:\s*"([\s\S]*?)"(?:\s*,|\s*\})/

)

if(match){

responseText=

match[1]

.replace(/\\n/g,'\n')

}

}


const botMsg={

id:makeId(),

role:'assistant',

text:responseText,

source:data.fromCache

?

'Cache ⚡'

:

'Gemini 🧠',

time:now()

}


setMessages(prev=>{

const updated=[

...prev,

botMsg

]

saveChat(

text,

updated

)

return updated

})


if(

data.geoJson

&&

onGeoResults

){

onGeoResults(

data.geoJson

)

}

}catch{

setError(

'Impossible de contacter le serveur'

)

}

finally{

setLoading(false)

}

},

[loading,onGeoResults]

)


return{

messages,

loading,

error,

sendMessage,

setMessages,

createNewChat

}

}