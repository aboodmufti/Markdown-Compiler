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

  var bang = bangCheck(currLine,nextLine,i)
  if(bang != ""){
    output += bang
    continue;
  }
  //console.log("DEBUG 1")
  var normalText = checkText(currLine)
  output += "<p>"+normalText+"</p>"
}

output += "</body></html>"

fs.writeFileSync('output.html',output)

function checkText(currLine){
  currLine = currLine.trim()
  var italics_ast = false
  var italics_under = false
  var bold_ast = false
  var bold_under = false
  var strike = false
  var output = ""
  var skip = 0 
  for (var i = 0; i < currLine.length; i++) {
    currChar = currLine[i]
    nextChar = currLine[i+1]

    switch(currChar){
      case "*":
        //console.log("DEBUG 3")
        if(nextChar == "*"){
          if(bold_ast){
            bold_ast = false
            output += "</strong>"
            skip = 2
          }else{
            var ending = false
            for (var j = i+2; j < currLine.length; j++) {
                if(currLine[j] == "*" && currLine[j+1] == "*"){
                  ending = true
                  break
                }
            }
            if(ending){
              output += "<strong>"
              bold_ast = true
              skip = 2
            }
          }
        }else{
          if(italics_ast){
            italics_ast = false
            output += "</em>"
            skip = 1
          }else{
            var ending = false
            for (var j = i+1; j < currLine.length; j++) {
                if(currLine[j] == "*" ){
                  ending = true
                  break
                }
            }
            if(ending){
              output += "<em>"
              italics_ast = true
              skip = 1
            }
          }
        }
        //code
        break;
      case "_":
        if(nextChar == "_"){
          if(bold_under){
            bold_under = false
            output += "</strong>"
            skip = 2
          }else{
            var ending = false
            for (var j = i+2; j < currLine.length; j++) {
                if(currLine[j] == "_" && currLine[j+1] == "_"){
                  ending = true
                }
            }
            if(ending){
              output += "<strong>"
              bold_under = true
              skip = 2
            }
          }
        }else{
          if(italics_under){
            italics_under = false
            output += "</em>"
            skip = 1
          }else{
            var ending = false
            for (var j = i+1; j < currLine.length; j++) {
                if(currLine[j] == "_" ){
                  ending = true
                  break
                }
            }
            if(ending){
              output += "<em>"
              italics_under = true
              skip = 1
            }
          }
        }
        //code
        break;
      case "~":
        if(nextChar == "~"){
          if(strike){
            strike = false
            output += "</del>"
            skip = 2
          }else{
            var ending = false
            for (var j = i+2; j < currLine.length; j++) {
                if(currLine[j] == "~" && currLine[j+1] == "~"){
                  ending = true
                }
            }
            if(ending){
              output += "<del>"
              strike = true
              skip = 2
            }
          }
        }
        //code
        break;
      case "[":
        if(currLine.substring(i,currLine.length).match(/\[(.*?)\]\((.*?)\s\"(.*?)\"\)/)){
          var match = currLine.substring(i,currLine.length).match(/\[(.*?)\]\((.*?)\s\"(.*?)\"\)/)
          console.log("Link detected")
          var text = match[1]
          var url = match[2]
          var title = match[3]
          output += '<a href="'+url+'" title="'+title+'">'+text+'</a>'
          //skip = currLine.substring(i,currLine.length).match(/\)/).index - i +1
          skip = match[0].length

        }else if(currLine.substring(i,currLine.length).match(/\[(.*?)\]\((.*?)\)/)){
          var match = currLine.substring(i,currLine.length).match(/\[(.*?)\]\((.*?)\)/)
          console.log("Link detected")
          var text = match[1]
          var url = match[2]
          output += "<a href='"+url+"'>"+text+"</a>"
          //skip = currLine.substring(i,currLine.length).match(/\)/).index - i +1
          skip = match[0].length
          //console.log("skip: "+skip)
        }
        break

    }

    if(skip > 0){
      i += skip -1 
      skip = 0
      continue;
    }
    output += currChar
  }
  return output
}


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