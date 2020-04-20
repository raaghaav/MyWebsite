const spandetector = document.getElementById("span-detector");
window.addEventListener("load",function(){
    const client = ["Javascript.","HTML/CSS.", "Nodejs.", "React/Angular."];
    typewriter(spandetector,client);
});

function typewriter(spandetector,client){
    let txt = "";  // assuming text is empty in beginning  i.e  text length is 0 in beginning 
    let wordindex = 0 ; // wordindex is from clients 
    let isDeleting = false ;

    function typer(){
        let wait = 70;
        wordindex = wordindex % client.length ;  // wordIndex aa jayegi isse aur wo humesha client.length ki bound main rahega
        let word = client[wordindex]; // word nikal raha hoon clients array se 

        if (isDeleting == true){  // if text ki length decrease ho rahi hai 
            txt = word.substring(0,txt.length-1);
        }else{
            txt = word.substring(0,txt.length+1); // suppose "Everyone" main 0 se 1, i.e E (first case)
        } ;    // if text ki length increase ho rahi hai 


        spandetector.textContent = txt; 
        const largePause = 2300;   // when 1 word got printed and deleted then we need long pause 


        if(isDeleting == true && txt == ""){  // i.e "Everyone" pura print ho kar delete bhi ho gaya ho hai toh next word aayega 
            wordindex++ ;
            isDeleting = false ;  // b/c next word print ho raha hai 
         }
  
        else if(isDeleting == false && txt.length == word.length ){
            isDeleting =true ;
            wait = largePause ;  // pura delete ho gaya ek word fhir long pause hoga 
        }


        setTimeout(function(){      // setTimeout call kr raha hoon aur uske andar typer() fn fhir se call kar raha hoon 
            typer();
        },wait);
    };

    typer();

}
