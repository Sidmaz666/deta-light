function render_page(page){
  let disable_page = []
  let enable_page 
  if(page == "chat"){
	disable_page.push('image_page','initial_page')
    	enable_page = 'chat_page'
    	document.title = "Deta Light Chat"
  } else if(page == "image"){
	disable_page.push('chat_page','initial_page')
    	enable_page = 'image_page'
    	document.title = "Deta Light Image Generation"
  } else {
	disable_page.push('chat_page','image_page')
    	enable_page = 'initial_page'
    	document.title = "Welcome To Deta Light"
  }
  disable_page.forEach((t) => {
    document.getElementById(t).style.display = "none"
  })
  document.getElementById(enable_page).style.display = "flex"
}

const scrollToBottom = (id,val) => {
    const element = document.getElementById(id);
    element.scrollTop = element.scrollHeight + val;
}

function write_prompt(mode,text,by){
  if(!text)return
  if(mode=="chat"){
	const select_parent = document.getElementById('chat_msg_div')
	const html2write = `
	<pre class="w-full bg-gray-300 p-2 whitespace-pre-wrap ${by == "You" ? 'nohighlight' : ''}">${by == "AI" ? '<span class="text-green-500">' + by + '</span>' : '<span class="text-blue-500">' + by + " " + '</span>' }<code class="rounded-md bg-gray-300">${text.replace(/^\s+|\s+$/gm, '')}</code></pre>
	`
    select_parent.insertAdjacentHTML('beforeEnd', html2write)
    scrollToBottom('chat_msg_div',1000)
    hljs.highlightAll();
  } else {
	const select_parent = document.getElementById('image_msg_div')
	const html2write = `
	<pre class="w-full bg-gray-300 p-2 whitespace-pre-wrap ${by == "You" ? 'nohighlight' : ''}">${by == "AI" ? '<span class="text-green-500">' + by + '</span>' : '<span class="text-blue-500">' + by + " " + '</span>' }<code class="rounded-md bg-gray-300">${by == "AI" ? '<img src="'+text+'" alt="AI Generated Image"/><br/>' : text }</code></pre>
	`
    select_parent.insertAdjacentHTML('beforeEnd', html2write)
    setTimeout(() => {
    scrollToBottom('image_msg_div',10000)
    },2000)
  }
}

function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}


async function call_api(prompt_element,ai_mode){
  let track_convo
  const base_url = "https://openai-helper-api.vercel.app/"
  const text = prompt_element.value.replace(/\s+/g, ' ').trim()
  let newURL

  if(ai_mode == "chat"){
    track_convo = text
    write_prompt("chat", text, "You")
    newURL=base_url + `?prompt=${track_convo}`
  } else {
    write_prompt("image", text, "You")
    newURL=base_url + `generate_image/?prompt=${text}&size=512x512`
  }

  prompt_element.value = ""

  let response
  let err

  try {
  const request = await axios(newURL) 
    if(ai_mode=="chat"){
    response  = `
    ${
      escapeHtml(await request.data.data.response.toString().replace(/^\s+|\s+$/g, ''))
    }
      `
    } else {
      response = await request.data.data.image_url
    }
  } catch (error){
    err = error
    response = `<span class="text-red-400">Too Long Prompt or Response! Can't Process 😢 </span>`
  if(ai_mode == "chat"){
    track_convo = ''
   }
  }

  if(ai_mode=="chat"){
    write_prompt("chat", response, "AI")
    scrollToBottom('chat_msg_div',1000)
    track_convo = track_convo + response
  } else {
    write_prompt("image", response, err ? 'SERVER' : 'AI')
    scrollToBottom('image_msg_div',10000)
  }

}

