// Declare document get element variables.
var buttonEl = document.getElementById("translatebtn");
var inLanguageEl = document.getElementById("dropDownInput");
var outLanguageEl = document.getElementById("dropDownOutput");
var inTextEl = document.getElementById("inputText");
var outTextEl = document.getElementById("translationOutput");
var loadAnimation =document.getElementById("load_animation");
// Array for the translation history
var transHistory = [];

// Button handler for translating user input text
buttonEl.addEventListener("click", handleTranslateBtnEvent);
// Button hander for clicking individual words in the translated text area
outTextEl.addEventListener("click", handleWordClickEvent);

// Event listener function for the translate button
function handleTranslateBtnEvent() {

    // Load icon animation starts on button event
    loadAnimation.setAttribute("class", "shown");

    // Get the values of input/output language and input text that a user entered
    var inLang = inLanguageEl.children[1].children[0].value;
    var outLang = outLanguageEl.children[1].children[0].value;
    var inText = inTextEl.value.trim();

    // Sets default values for when we run out of fetches
    var default_input = "I'm trying to get Google to translate this sentence, but we've run out of fetches!";
    var default_output = "Estoy tratando de que Google traduzca esta oración, ¡pero nos hemos quedado sin búsquedas!";

    // Save recent selected input output languages to local storage.
    var selectedLanguage = {
        inLanguage: inLang,
        outLanguage: outLang,
    };
    localStorage.setItem("recentLang", JSON.stringify(selectedLanguage));

    // Declare variables for google translate API fetch.
    const encodedParams = new URLSearchParams();
    encodedParams.append("q", inText);
    encodedParams.append("format", "text");
    encodedParams.append("target", outLang);
    encodedParams.append("source", inLang);
    
    // Google Translate API fetch options - as provided in their documentation
    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Accept-Encoding': 'application/gzip',
            'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com',
            'X-RapidAPI-Key': 'f9d27df0famsh52cbad18064f546p10dce4jsn6f191d20cc75'
        },
        body: encodedParams
    };

    // Google translate fetch -----------------------------
    fetch('https://google-translate1.p.rapidapi.com/language/translate/v2', options)
	.then(response => {
        // Condition for a bad response.
        if (response.ok) {
            response.json().then(body => {
                var newSentence = {
                    inputLang: inLang,
                    inputText: inText,
                    outputLang: outLang,
                    outputText: body.data.translations[0].translatedText,
                };
                makeNRenderHistory(newSentence);
            })
        }
        else {
            var newSentence = {
                inputLang: "en",
                inputText: default_input,
                outputLang: "es",
                outputText: default_output,
            };
            makeNRenderHistory(newSentence);
        }
    })
	.catch(err => console.error(err));
    // End of Google translate API fetch -------------------------
 
    // Clear input text area.
    inTextEl.value = "";     
}

// Handle click event on individual words.
function handleWordClickEvent(event) {
    if(event.target.nodeName !== "SPAN") {
        return;
    }

    // Cleaning up the clicked word, removing spaces
    var language = event.target.parentElement.textContent.slice(1,3);
    var selectedWord = event.target.textContent.trim();

    // Cleaning up the clicked word, removing extra question mark
    if(selectedWord[selectedWord.length-1] === "?") {
        selectedWord = selectedWord.slice(0,selectedWord.length-1);
    }

    // Gets the definition and synonyms if the clicked word is in English
    if (event.target.lang=="en") {
        getDefinition(selectedWord, event.target.lang, event.target.dataset.opplang);
        getSynonyms(selectedWord, event.target.lang, event.target.dataset.opplang);
    }
    // Replacement text in case the clicked word is not in English
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

    // Populaes the text area
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


        // Configure innerHTML for inputText.
        innerEl = "(" + transHistory[i].inputLang + "): ";
        wordList = transHistory[i].inputText.split(" ");
        for(var j = 0; j < wordList.length; j++) {
            innerEl = innerEl + '<span data-oppLang="' +transHistory[i].outputLang+ '" lang="'+transHistory[i].inputLang+'">' + wordList[j] + " </span>";
        }
        inputTextEl.innerHTML = innerEl;


        // Configure innerHTML for outputText.
        innerEl = "(" + transHistory[i].outputLang + "): ";
        wordList = [];
        wordList = transHistory[i].outputText.split(" ");
        for(var k = 0; k < wordList.length; k++) {
            innerEl = innerEl + '<span data-oppLang="' +transHistory[i].inputLang+ '" lang="'+transHistory[i].outputLang+ '">' + wordList[k] + " </span>";
        }
        outputTextEl.innerHTML = innerEl;

        // Insert the configured innerHTML to outTextEl
        if(addOne) {
            outTextEl.prepend(outputTextEl);
            outTextEl.prepend(inputTextEl);
            // If # of saved history exceed 10, remove the last one
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

// Load localstorage on page load or refresh.
function loadHistoryNRender() {
    // Load the stored history from the local storage
    transHistory = JSON.parse(localStorage.getItem("history"));
    if(!transHistory) {
        transHistory = [];
    }
    renderHistory(false, 0);
}

function makeDropdownOptions() {
    // Language key value pairs.
    var languageKeyValuePairs = {
        catalan: 'ca', danish: 'da', dutch: 'nl', english: 'en', finnish: 'fi', 
        french: 'fr', german: 'de', irish: 'ga', italian: 'it', latin: 'la',
        polish: 'pl', portuguese: 'pt', russian: 'ru', samoan: 'sm', spanish: 'es',
        swedish: 'sv', ukrainian: 'uk',
    }      
    // Convert key value pairs object to individual arrays.
    const languageName = Object.keys(languageKeyValuePairs);
    const languageCode = Object.values(languageKeyValuePairs);

    var recentLang = JSON.parse(localStorage.getItem("recentLang"));
    if(!recentLang) {
        recentLang = {
            inLanguage : "nothing",
            outLanguage : "nothing",
        }
    }

    // Populate language drop-down options.
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

        // Only English languge is allowed in dropdown menu for input language. 
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

// Fetches and returns the definitions from Webster's Dictionary API.
function getDefinition(word, langIn, langTwo) {
    // Clears the output definition boxes
    document.getElementById("outputDefinitionL").textContent = "";
    document.getElementById("outputDefinitionR").textContent = "";

    //Merriam-Webster Dictionary API key
    const dict_API = "0b37ddb6-0f97-4062-879a-5ff3aa4ddbc5";

    //Placeholder if statements for when the clicked words are not in english
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

    //Placeholder populated definitions
    document.getElementById("definitionL").innerText = "Definition for: " +needTranslateL+word;
    document.getElementById("definitionR").innerText = "Definition for: " +needTranslateR+word;

    // Merriam-Webster Fetch ---------------------------------
    fetch("https://www.dictionaryapi.com/api/v3/references/collegiate/json/" +word+ "?key=" +dict_API)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        // document.getElementById("outputDefinitionL").innerText = needTranslateL + "\n";
        document.getElementById("outputDefinitionR").innerText = needTranslateR + "\n";
        // Limits definition count to three entries
        for (let i=0; i<3; i++){
            if(data[i].fl) {
                // Populates the DOM with the definitions (left side - clicked word)
                document.getElementById("outputDefinitionL").innerText += "(" +data[i].fl+ "):: " +data[i].shortdef + "\n\n";
            } 
            else {
                break;
            }
        }

                // Limits definition count to three entries (right side - translation of clicked word)
        for (let i=0; i<3; i++){
            if(data[i].fl) {
                document.getElementById("outputDefinitionR").innerText += "(" +data[i].fl+ "):: " +data[i].shortdef + "\n\n";
            } 
            else {
                break;
            }
        }
    });
    // --------------------------------------------------------
}

// Fetches and returns the synonyms from Webster's Dictionary API.
function getSynonyms(word, langIn, langTwo) {
    // Clears the output synonym boxes
    document.getElementById("outputSynonymL").textContent = "";
    document.getElementById("outputSynonymR").textContent = "";

    // Merriam-Webster API Key
    const thes_API = "ff7cd07e-31b4-4b0e-a50b-80865fe2b28a";
    var syn_String = "";

    //Placeholder if statements for when the clicked words are not in english
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


    // Merriam-Webster Thesaurus (Synonym) Fetch ----------------------------------------
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

function makeNRenderHistory(newSentence) {
    // Loading icon animation is hidden when response is finished.
    loadAnimation.setAttribute("class", "hidden");

    // Load the stored history from the local storage.
    transHistory = JSON.parse(localStorage.getItem("history"));
    if(!transHistory) {
        transHistory = [];
    }
    // Add a new object to the beginning of the history array. 
    transHistory.unshift(newSentence);
    // The max number of the history is limited to 10.
    while(transHistory.length > 10) {
        transHistory.pop();
    }
    // Save the history array to the localStorage.
    localStorage.setItem("history", JSON.stringify(transHistory));
    // Check how many translation histories are saved.
    var pEls = document.querySelectorAll("#translationOutput>p");
    // Put history data to the proper text area.
    if((pEls.length/2 === transHistory.length-1) || (pEls.length/2 === 10 && transHistory.length === 10)) {
        renderHistory(true, pEls.length);
    }
    else {
        renderHistory(false, pEls.length);
    }
}

loadHistoryNRender();