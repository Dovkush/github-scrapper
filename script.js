#!/usr/bin/env node

const request = require("request");
const cheerio=require("cheerio");
const { jsPDF } = require("jspdf");
let $;
let fs=require("fs");
let data={};
function linkGenerator(error,response,body) {
    if(!error&&response.statusCode==200){
    
    $=cheerio.load(body);
    let alltopics=$(".no-underline.d-flex.flex-column.flex-justify-center");
    let alltopicNames=$(".f3.lh-condensed.text-center.Link--primary.mb-0.mt-1");
    for(let x=0;x<3;x++){
        getTopicPage($(alltopicNames[x]).text().trim(),
        "https://github.com/"+$(alltopics[x]).attr("href"));
        
    }
 }
}
function getTopicPage(name,url){
  request(url,function (error,res,body){
    if(!error&&res.statusCode==200){
      $=cheerio.load(body);
      let allprojects=$(".f3.color-text-secondary.text-normal.lh-condensed .text-bold");
      if(allprojects.length>8){
       allprojects= allprojects.slice(0,8);
      }
      for(let x=0;x<allprojects.length;x++){
        let projectLink="https://github.com/"+$(allprojects[x]).attr("href");
        let projectTitle=$(allprojects[x]).text().trim();
        if(!data[name]){
          data[name]=[{name:projectTitle,Link:projectLink}];
        }else{
          data[name].push({name:projectTitle,Link:projectLink});
        }
        getIssuePage(projectTitle,name,projectLink+"/issues");
      }
         
     }
 });
  
}
function getIssuePage(projectName,topicName,url){
  request(url,function(error,response,body){
    if(!error&&response.statusCode==200){
      $=cheerio.load(body);
      let allIssues=$(".Link--primary.v-align-middle.no-underline.h4.js-navigation-open");
      for(let x=0;x<allIssues.length;x++){
        let issueName=$(allIssues[x]).text().trim();
        let issueLink="https://github.com/"+$(allIssues[x]).attr("href");
        let index=-1;
        for(let i=0;i<data[topicName].length;i++){
           if(data[topicName][i].name===projectName){
             index=i;
             break;
           }
         }
         if(!data[topicName][index].issues){
           data[topicName][index].issues=[{issueName,issueLink}];
         }else{
           data[topicName][index].issues.push({issueName,issueLink});
         }
        }
      fs.writeFileSync("data.json",JSON.stringify(data));
      pdfGenerator(data);
        
    }
  });
  
}
function pdfGenerator(d){
  for(x in d){
    if(!fs.existsSync(x)) fs.mkdirSync(x); 
    let path="./"+x+"/";
    
     
     for(y in d[x]){
      const doc=new jsPDF();
      let issueArr=d[x][y].issues;
      let spacing=1;
       for(z in issueArr){
        doc.text(issueArr[z].issueName,10,10*spacing);
        doc.text(issueArr[z].issueLink,10,10*spacing+5);
        spacing++;
       }
       if(fs.existsSync(path+d[x][y].name+".pdf"))
       fs.unlinkSync(path+d[x][y].name+".pdf");
       doc.save(path+d[x][y].name+".pdf");
     }
     
  }  
  }
 request("https://github.com/topics",linkGenerator);