var buttonEl = document.getElementById("translatebtn");
var inLanguageEl = document.getElementById("dropDownInput");
var outLanguageEl = document.getElementById("dropDownOutput");
var inTextEl = document.getElementById("inputText");
var outTextEl = document.getElementById("translationOutput");
var loadAnimation =document.getElementById("load_animation");
// Array for the translation history
var transHistory = [];

buttonEl.addEventListener("click", handleTranslateBtnEvent);
outTextEl.addEventListener("click", handleWordClickEvent);

// Event listener function for the translate button
function handleTranslateBtnEvent() {
    loadAnimation.setAttribute("class", "shown");

    // get the values of input/output language and input text that a user entered
    var inLang = inLanguageEl.children[1].children[0].value;
    var outLang = outLanguageEl.children[1].children[0].value;
    var inText = inTextEl.value.trim();

    // setting default values in case we run out of fetches
    var default_input = "I'm trying to get Google to translate this sentence, but we've run out of fetches!";
    var default_output = "Estoy tratando de que Google traduzca esta oración, ¡pero nos hemos quedado sin búsquedas!";

    // save the recent selected language to the local storage
    var selectedLanguage = {
        inLanguage: inLang,
        outLanguage: outLang,
    };
    localStorage.setItem("recentLang", JSON.stringify(selectedLanguage));

    const encodedParams = new URLSearchParams();
    encodedParams.append("q", inText);
    encodedParams.append("format", "text");
    encodedParams.append("target", outLang);
    encodedParams.append("source", inLang);
    
    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Accept-Encoding': 'application/gzip',
            'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com',
            // THESE ARE THE GOOD API KEY'S
            // 'X-RapidAPI-Key': '5281658b66msh7dccb31e2c9a977p1b3f77jsnd0b6321375de'
            // 'X-RapidAPI-Key': '4462cedcafmsh7fc7d037b317c29p122959jsn8dfc43a7f111'
            // THIS IS THE BAD API KEY TO TEST THE CATCH CONDITIONALS
            'X-RapidAPI-Key': 'foianmew;ofinaoerigneaoirgn;ae'
        },
        body: encodedParams
    };

    //-----------------------------
    fetch('https://google-translate1.p.rapidapi.com/language/translate/v2', options)
	.then(response => response.json())
	.then(response => {
        loadAnimation.setAttribute("class", "hidden");  
        // Condition for a bad response.
        if (!response.status) {
            //Create a new object to store basic default information
            var newSentence = {
                inputLang: "en",
                inputText: default_input,
                outputLang: "es",
                outputText: default_output,
            };
            // load the stored history from the local storage
            transHistory = JSON.parse(localStorage.getItem("history"));
            if(!transHistory) {
                transHistory = [];
            }
            // Add a new object to the beginning of the history array 
            transHistory.unshift(newSentence);
            // Max number of the history limited by 10
            while(transHistory.length > 10) {
                transHistory.pop();
            }
            // Save the history array to the localStorage
            localStorage.setItem("history", JSON.stringify(transHistory));
            // How many translation histories are saved
            var pEls = document.querySelectorAll("#translationOutput>p");
            // Put history data to the proper text area
            if((pEls.length/2 === transHistory.length-1) || (pEls.length/2 === 10 && transHistory.length === 10)) {
                renderHistory(true, pEls.length);
            }
            else {
                renderHistory(false, pEls.length);
            }
            return;
        }
        // If we get a good response
        else {
            console.log(response);
            console.log(response.data.translations[0].translatedText);
            //Create a new object to store information of this translation 
            var newSentence = {
                inputLang: inLang,
                inputText: inText,
                outputLang: outLang,
                outputText: response.data.translations[0].translatedText,
            };
            // load the stored history from the local storage
            transHistory = JSON.parse(localStorage.getItem("history"));
            if(!transHistory) {
                transHistory = [];
            }
            // Add a new object to the beginning of the history array 
            transHistory.unshift(newSentence);
            // Max number of the history limited by 10
            while(transHistory.length > 10) {
                transHistory.pop();
            }
            // Save the history array to the localStorage
            localStorage.setItem("history", JSON.stringify(transHistory));
            // How many translation histories are saved
            var pEls = document.querySelectorAll("#translationOutput>p");
            // Put history data to the proper text area
            if((pEls.length/2 === transHistory.length-1) || (pEls.length/2 === 10 && transHistory.length === 10)) {
                renderHistory(true, pEls.length);
            }
            else {
                renderHistory(false, pEls.length);
            } 
        }
    })
    
	.catch(err => console.error(err));
    //-------------------------
 
    // clear input text value
    inTextEl.value = ""; 
    
}

function handleWordClickEvent(event) {
    if(event.target.nodeName !== "SPAN") {
        return;
    }

    console.log(event);

    var language = event.target.parentElement.textContent.slice(1,3);
    var selectedWord = event.target.textContent.trim();

    console.log(language, selectedWord);

    if (event.target.lang=="en") {
        getDefinition(selectedWord, event.target.lang, event.target.dataset.opplang);
        getSynonyms(selectedWord, event.target.lang, event.target.dataset.opplang);
    }
    else {
        document.getElementById("selectedWordL").innerText = selectedWord +" ("+event.target.lang+")";
        document.getElementById("selectedWordR").innerText = selectedWord +" ("+event.target.dataset.opplang+")";
        document.getElementById("definitionL").innerText = "Definition for: <NEED TO TRANSLATE>" +selectedWord;
        document.getElementById("definitionR").innerText = "Definition";
        document.getElementById("synonymsL").innerText = "Synonyms for: <NEED TO TRANSLATE>" +selectedWord;
        document.getElementById("synonymsR").innerText = "Synonyms";
        document.getElementById("outputDefinitionL").innerText = "";
        document.getElementById("outputDefinitionR").innerText = "";
        document.getElementById("outputSynonymL").innerText = "";
        document.getElementById("outputSynonymR").innerText = "";
    }
}

// Argument: "addOne" 
// <true> - insert only the latest translation thing at the beginning of outTextEl
// <false> - insert all data stored in localstorage to outTextEl
// Argument : "pElsLength" - number of p elements under div(#translationOutput), 1 translation hitory has 2 p elements.
function renderHistory(addOne, pElsLength) {
    if (transHistory.length === 0) {
        return;
    }

    // var pEls = document.querySelectorAll("#translationOutput>p");
    var iterateMax = (addOne)?1:transHistory.length;
    
    // Clear textContent of Div when the first translation history is added. (THIS CODE CAN BE REMOVED IF THERE IS NO DEFAULT TEXT IN DIV)
    if(!pElsLength) {
        outTextEl.textContent = "";
    }

    if(!addOne) {
        while(outTextEl.lastElementChild){
            outTextEl.removeChild(outTextEl.lastElementChild); 
        }
    }

    for(var i = 0; i < iterateMax; i++) {
        var wordList = [];
        var inputTextEl = document.createElement("p"); 
        var outputTextEl = document.createElement("p");
        var innerEl;

        if(i >= 1 || pElsLength >=2) {
            var hrEl = document.createElement("hr");
            if(addOne) {
                outTextEl.prepend(hrEl);
            }
            else {
                outTextEl.appendChild(hrEl);
            }
        }

        // configure innerHTML for inputText
        // 'en' condition will be removed in the future
        innerEl = "(" + transHistory[i].inputLang + "): ";
        // if(transHistory[i].inputLang === "en") {
            wordList = transHistory[i].inputText.split(" ");
            for(var j = 0; j < wordList.length; j++) {
                innerEl = innerEl + '<span data-oppLang="' +transHistory[i].outputLang+ '" lang="'+transHistory[i].inputLang+'">' + wordList[j] + " </span>";
            }
        // }
        // else {
        //     innerEl = innerEl + transHistory[i].inputText;
        // }
        inputTextEl.innerHTML = innerEl;

        // configure innerHTML for outputText
        // 'en' condition will be removed in the future
        innerEl = "(" + transHistory[i].outputLang + "): ";
        // if(transHistory[i].outputLang === "en") {
            wordList = [];
            wordList = transHistory[i].outputText.split(" ");
            for(var k = 0; k < wordList.length; k++) {
                innerEl = innerEl + '<span data-oppLang="' +transHistory[i].inputLang+ '" lang="'+transHistory[i].outputLang+ '">' + wordList[k] + " </span>";
            }
        // }
        // else {
        //     innerEl = innerEl + transHistory[i].outputText;
        // }
        outputTextEl.innerHTML = innerEl;

        // insert the configured innerHTML to outTextEl
        if(addOne) {
            outTextEl.prepend(outputTextEl);
            outTextEl.prepend(inputTextEl);
            // if # of saved history exeed 10, remove the last one
            if(pElsLength === 20) {
                for(var l = 0; l < 3; l++) {
                    outTextEl.removeChild(outTextEl.lastElementChild);
                }
            }
        }
        else {
            outTextEl.appendChild(inputTextEl);
            outTextEl.appendChild(outputTextEl);
        }
    }
    return;
}

// load localstorage data for the web page loading or refreshing
function loadHistoryNRender() {
    // load the stored history from the local storage
    transHistory = JSON.parse(localStorage.getItem("history"));
    if(!transHistory) {
        transHistory = [];
    }
    renderHistory(false, 0);
}

function makeDropdownOptions() {
    // Key value pairs.
    var languageKeyValuePairs = {
        catalan: 'ca', danish: 'da', dutch: 'nl', english: 'en', finnish: 'fi', 
        french: 'fr', german: 'de', irish: 'ga', italian: 'it', latin: 'la',
        polish: 'pl', portuguese: 'pt', russian: 'ru', samoan: 'sm', spanish: 'es',
        swedish: 'sv', ukrainian: 'uk',
    }      
    // Convert keys and values to arrays.
    const languageName = Object.keys(languageKeyValuePairs);
    const languageCode = Object.values(languageKeyValuePairs);

    var recentLang = JSON.parse(localStorage.getItem("recentLang"));
    if(!recentLang) {
        recentLang = {
            inLanguage : "nothing",
            outLanguage : "nothing",
        }
    }

    // Loop through arrays and create drop-down options.
    for (i = 0; i < languageName.length; i++) {
        var name = languageName[i];
        var code = languageCode[i];
        var inOption = document.createElement('option');
        var outOption = document.createElement('option');

        // Capitalize the first letter of each language name.    
        var splitName = name.split(' ');
        for (j = 0; j < splitName.length; j++) {
            splitName[j] = splitName[j][0].toUpperCase() + splitName[j].substring(1); 
        }

        splitName = splitName.join(' ');
        name = splitName;

        outOption.value = code;
        outOption.text = name;
        if(code === recentLang.outLanguage) {
            outOption.setAttribute("selected", "true");
        } 
        document.getElementById('language-target-options').appendChild(outOption);

        // only English igit s allowed in dropdown menu for input language 
        if(code === "en") {
            inOption.value = code;
            inOption.text = name;
            if(code === recentLang.inLanguage) {
                inOption.setAttribute("selected", "true");
            }        
            document.getElementById('language-source-options').appendChild(inOption);
        }
    }
}

loadHistoryNRender();
makeDropdownOptions();

// Fetches and returns the definitions from Webster's Dictionary API
function getDefinition(word, langIn, langTwo) {
    document.getElementById("outputDefinitionL").textContent = "";
    document.getElementById("outputDefinitionR").textContent = "";

    const dict_API = "0b37ddb6-0f97-4062-879a-5ff3aa4ddbc5";
    var def_List = [];

    if (langIn !=="en") {
        var needTranslateL = "<NEED TO TRANSLATE> "
    }
    else {
        var needTranslateL = "";
    }
    if (langTwo !=="en") {
        var needTranslateR = "<NEED TO TRANSLATE> "
    }
    else {
        var needTranslateR = "";
    }

    document.getElementById("definitionL").innerText = "Definition for: " +needTranslateL+word;
    document.getElementById("definitionR").innerText = "Definition for: " +needTranslateR+word;

    fetch("https://www.dictionaryapi.com/api/v3/references/collegiate/json/" +word+ "?key=" +dict_API)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        // document.getElementById("outputDefinitionL").innerText = needTranslateL + "\n";
        document.getElementById("outputDefinitionR").innerText = needTranslateR + "\n";
        for (let i=0; i<3; i++){
            if(data[i].fl) {
                document.getElementById("outputDefinitionL").innerText += "(" +data[i].fl+ "):: " +data[i].shortdef + "\n\n";
            } 
            else {
                break;
            }
        }

        for (let i=0; i<3; i++){
            if(data[i].fl) {
                document.getElementById("outputDefinitionR").innerText += "(" +data[i].fl+ "):: " +data[i].shortdef + "\n\n";
            } 
            else {
                break;
            }
        }
    });
}

// Fetches and returns the synonyms from Webster's Dictionary API
function getSynonyms(word, langIn, langTwo) {
    document.getElementById("outputSynonymL").textContent = "";
    document.getElementById("outputSynonymR").textContent = "";

    const thes_API = "ff7cd07e-31b4-4b0e-a50b-80865fe2b28a";
    var syn_String = "";

    if (langIn !=="en") {
        var needTranslateL = "<NEED TO TRANSLATE> "
    }
    else {
        var needTranslateL = "";
    }
    if (langTwo !=="en") {
        var needTranslateR = "<NEED TO TRANSLATE> "
    }
    else {
        var needTranslateR = "";
    }

    document.getElementById("selectedWordL").innerText = needTranslateL +word +" ("+langIn+")";;
    document.getElementById("selectedWordR").innerText = needTranslateR +word +" ("+langTwo+")";;
    document.getElementById("synonymsL").innerText = "Synonyms for: " +needTranslateL+word;
    document.getElementById("synonymsR").innerText = "Synonyms for: " +needTranslateR+word;
    document.getElementById("outputSynonymL").textContent = needTranslateL;
    document.getElementById("outputSynonymR").textContent = needTranslateR;

    fetch("https://www.dictionaryapi.com/api/v3/references/thesaurus/json/"+word+"?key=" +thes_API)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        var syn_Array = (data[0].meta.syns[0]);
        
        if(data[0].meta.syns[0]) {
            if (syn_Array.length >1)
            {
                syn_String += syn_Array[0];

                for (let i=1; i<syn_Array.length; i++) {
                    syn_String += ", " +syn_Array[i];   
                    // console.log(i+ ". " +syn_Array[i]);
                }
            }
            else {
                syn_String += syn_Array[i]
            }
        }
        document.getElementById("outputSynonymL").textContent = needTranslateL + "\n" +syn_String + "\n";

        document.getElementById("outputSynonymR").textContent = needTranslateR + "\n" +syn_String + "\n";
    });
}

loadHistoryNRender();