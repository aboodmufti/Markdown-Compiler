var fs = require("fs")


var rawData = fs.readFileSync('test.md', 'utf-8')
var lines = rawData.split('\n');

var output = "<html><header></header><body>"
var nextLine = ""

for(var i = 0 ; i < lines.length; ++i){
  var currLine = lines[i]
  if(i+1 < lines.length){
    nextLine = lines[i+1]
  }else{
    nextLine = ""
  }

  var underlineSingle = underlineCheckSingle(currLine,nextLine,i)
  if(underlineSingle[1] != i){
    i = underlineSingle[1] 
    output += underlineSingle[0]
    continue;
  }
  
  var underlineDouble = underlineCheckDouble(currLine,nextLine,i)
  if(underlineDouble[1] != i){
    i = underlineDouble[1] 
    output += underlineDouble[0]
    continue;
  }

  output += bangCheck(currLine)

}

output += "</body></html>"

fs.writeFileSync('output.html',output)


function underlineCheckSingle(currLine,nextLine,index){
  var bangCounter = 0
  var stoppedAt = 0
  var started = false
  var ended = false
  var streak = true
  var bad = false
  for (var j = 0, len = nextLine.length; j < len; j++) {
    if(nextLine[j] == "-"){
      ++bangCounter
      if(bangCounter == 1){
        started = true
      }
      if(ended){
        bad = true
      }
    }else if(nextLine[j] == " "){
      if(started){
        ended = true 
        streak = false 
      }
    }else{
      bad = true
      break;
    }
  }

  //var text = currLine.substring(stoppedAt, currLine.length);
  if(bangCounter > 0){
    return [heading(2,currLine),++index]
  }else{
    return ["",index]
  }
}


function underlineCheckDouble(currLine,nextLine,index){
  var bangCounter = 0
  var stoppedAt = 0
  var started = false
  var ended = false
  var streak = true
  var bad = false
  for (var j = 0, len = nextLine.length; j < len; j++) {
    if(nextLine[j] == "="){
      ++bangCounter
      if(bangCounter == 1){
        started = true
      }
      if(ended){
        bad = true
      }
    }else if(nextLine[j] == " "){
      if(started){
        ended = true 
        streak = false 
      }
    }else{
      bad = true
      break;
    }
  }

  //var text = currLine.substring(stoppedAt, currLine.length);
  if(bangCounter > 0){
    return [heading(1,currLine),++index]
  }else{
    return ["",index]
  }
}

function bangCheck(currLine){
  var bangCounter = 0
  var stoppedAt = 0
  for (var j = 0, len = currLine.length; j < len; j++) {
    if(currLine[j] == "#"){
      ++bangCounter
    }else if(currLine[j] == " "){
      continue;
    }else{
      stoppedAt = j
      break;
    }
  }
  var bangText = currLine.substring(stoppedAt, currLine.length);
  if(bangCounter > 0){
    return heading(bangCounter,bangText)
  }else{
    return ""
  }
}

function heading(num,text){
  var heading = "<h"+num+">"+text+"</h"+num+">"
  return heading
}