var buttonEl = document.getElementById("translatebtn");
var inLanguageEl = document.getElementById("dropDownInput");
var outLanguageEl = document.getElementById("dropDownOutput");
var inTextEl = document.getElementById("inputText");
var outTextEl = document.getElementById("translationOutput");

// Array for the translation history
var transHistory = [];

buttonEl.addEventListener("click", replaceButtonEvent);
outTextEl.addEventListener("click", handleWordClickEvent);

// Event listener function for the translate button
function handleTranslateBtnEvent() {
    // get the values of input/output language and input text that a user entered
    var inLang = inLanguageEl.children[1].children[0].value;
    var outLang = outLanguageEl.children[1].children[0].value;
    var inText = inTextEl.value.trim();

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
            'X-RapidAPI-Key': '5281658b66msh7dccb31e2c9a977p1b3f77jsnd0b6321375de'
        },
        body: encodedParams
    };

    //-----------------------------
    // fetch('https://google-translate1.p.rapidapi.com/language/translate/v2', options)
	// .then(response => response.json())
	// .then(response => {
    //     console.log(response.status);
    //     // Condition for the response.
    //     if (response.status >= 400) {
    //         outTextEl.textContent = response.status;
    //     }
    //     console.log(response);
    //     console.log(response.data.translations[0].translatedText);
    //     //Create a new object to store information of this translation 
    //     var newSentence = {
    //         inputLang: inLang,
    //         inputText: inText,
    //         outputLang: outLang,
    //         outputText: "translated sentence",
    //     };
    //     // load the stored history from the local storage
    //     transHistory = JSON.parse(localStorage.getItem("history"));
    //     if(!transHistory) {
    //         transHistory = [];
    //     }
    //     // Add a new object to the beginning of the history array 
    //     transHistory.unshift(newSentence);
    //     // Max number of the history limited by 10
    //     while(transHistory.length > 10) {
    //         transHistory.pop();
    //     }
    //     // Save the history array to the localStorage
    //     localStorage.setItem("history", JSON.stringify(transHistory));
    //     // How many translation histories are saved
    //     var pEls = document.querySelectorAll("#translationOutput>p");
    //     // Put history data to the proper text area
    //     if((pEls.length/2 === transHistory.length-1) || (pEls.length/2 === 10 && transHistory.length === 10)) {
    //         renderHistory(true, pEls.length);
    //     }
    //     else {
    //         renderHistory(false, pEls.length);
    //     }
    // })
	// .catch(err => console.error(err));
    //-------------------------
 
    // clear input text value
    inTextEl.value = "";
}

function handleWordClickEvent(event) {
    if(event.target.nodeName !== "SPAN") {
        return;
    }

    var language = event.target.parentElement.textContent.slice(1,3);
    var selectedWord = event.target.textContent.trim();

    console.log(language, selectedWord);

    getDefinition(selectedWord);
    getSynonyms(selectedWord);
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
        if(transHistory[i].inputLang === "en") {
            wordList = transHistory[i].inputText.split(" ");
            for(var j = 0; j < wordList.length; j++) {
                innerEl = innerEl + "<span>" + wordList[j] + " </span>";
            }
        }
        else {
            innerEl = innerEl + transHistory[i].inputText;
        }
        inputTextEl.innerHTML = innerEl;

        // configure innerHTML for outputText
        // 'en' condition will be removed in the future
        innerEl = "(" + transHistory[i].outputLang + "): ";
        if(transHistory[i].outputLang === "en") {
            wordList = [];
            wordList = transHistory[i].outputText.split(" ");
            for(var k = 0; k < wordList.length; k++) {
                innerEl = innerEl + "<span>" + wordList[k] + " </span>";
            }
        }
        else {
            innerEl = innerEl + transHistory[i].outputText;
        }
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
function getDefinition(word) {
    const dict_API = "0b37ddb6-0f97-4062-879a-5ff3aa4ddbc5";
    var def_List = [];

    fetch("https://www.dictionaryapi.com/api/v3/references/collegiate/json/" +word+ "?key=" +dict_API)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        document.getElementById("outputDefinitionL").innerText = "";
        for (let i=0; i<3; i++){
            if(data[i].fl) {
                document.getElementById("outputDefinitionL").innerText += "(" +data[i].fl+ "):: " +data[i].shortdef + "\n";
            } 
            else {
                break;
            }
        }
    });
}

// Fetches and returns the synonyms from Webster's Dictionary API
function getSynonyms(word) {
    const thes_API = "ff7cd07e-31b4-4b0e-a50b-80865fe2b28a";
    var syn_String = "";

    fetch("https://www.dictionaryapi.com/api/v3/references/thesaurus/json/"+word+"?key=" +thes_API)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        var syn_Array = (data[0].meta.syns[0]);
        
        if(data[0].meta.syns[0]) {
            if (syn_Array.length >1)
            {
                syn_String = syn_Array[0];

                for (let i=1; i<syn_Array.length; i++) {
                    syn_String += ", " +syn_Array[i];   
                    // console.log(i+ ". " +syn_Array[i]);
                }
            }
            else {
                syn_String = syn_Array[i]
            }
        }
        document.getElementById("outputSynonymL").textContent = syn_String + "\n";
    });
}

loadHistoryNRender();

function replaceButtonEvent() {
    // get the values of input/output language and input text that a user entered
    var inLang = inLanguageEl.children[1].children[0].value;
    var outLang = outLanguageEl.children[1].children[0].value;
    var inText = inTextEl.value.trim();

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
            'X-RapidAPI-Key': '5281658b66msh7dccb31e2c9a977p1b3f77jsnd0b6321375de'
        },
        body: encodedParams
    };

    //Create a new object to store information of this translation 
    var newSentence = {
        inputLang: inLang,
        inputText: inText,
        outputLang: outLang,
        outputText: "translated sentence",
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
    inTextEl.value = "";
}