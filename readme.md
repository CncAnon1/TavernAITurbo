# TavernAI scale spellbook
quick hack to get tavernai to work with spellbook, based off of @cncanon's mod


## Usage
- Create scale spellbook account at https://spellbook.scale.com.
- Create an "App" (name/desc doesn't matter)
- Create a "Variant", which sets the parameters (preamble prompt, model temperature, stop sequence, respnse token limit, etc) for your bot
![https://i.imgur.com/ipmWkmu.png](https://i.imgur.com/ipmWkmu.png)
- Paste this in the "User" section of the prompt.
```
Complete the next response in this fictional roleplay chat.

{{ input }}
```
- Click "Save New Variant"
- Go to your new Variant and click Deploy
![https://i.imgur.com/5Tuj55L.png](https://i.imgur.com/5Tuj55L.png)
- This will create an API key and URL for your bot.
![https://i.imgur.com/eydf2XC.png](https://i.imgur.com/eydf2XC.png)
- Paste the URL into the `api_scale` variable in server.js
```javascript
# In server.js, around line 41
var api_scale = "https://dashboard.scale.com/spellbook/api/v2/deploy/q64278n"; // put your deployment URL here
```
- Paste the key into the usual place in TavernAI, or hardcode it in server.js
```javascript
# In server.js, around line 62
var api_key_scale = "your key here";
```

NOTE: You don't actually have to do this and you can use my hardcoded URL/key, but know that I can see anything you send to the bot unless you deploy your own.

After setting it up as described above, run it with `.\Start.bat`, then go to the Settings tab in Tavern's sidebar and choose "Scale" from the API dropdown menu.
