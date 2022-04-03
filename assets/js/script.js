var buttonEl = document.getElementById("translatebtn");
var inLanguageEl = document.getElementById("dropDownInput");
var outLanguageEl = document.getElementById("dropDownOutput");
var inTextEl = document.getElementById("inputText");

buttonEl.addEventListener("click", handleTranslateBtnEvent);

// Populate language input drop-down.
document.getElementById('language-source-options').onclick = function() {
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
    // Loop through arrays and create drop-down options.
    for (i = 0; i < languageName.length; i++) {
        var name = languageName[i];
        var code = languageCode[i];
        var option = document.createElement('option');
        option.value = code;
        option.text = name;
        document.getElementById('language-source-options').appendChild(option);
    }
};

// Populate language output drop-down.
document.getElementById('language-target-options').onclick = function() {
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
    // Loop through arrays and create drop-down options.
    for (i = 0; i < languageName.length; i++) {
        var name = languageName[i];
        var code = languageCode[i];
        var option = document.createElement('option');
        option.value = code;
        option.text = name;
        document.getElementById('language-target-options').appendChild(option);
    }
};

// Event listener function for the translate button
function handleTranslateBtnEvent() {
    // get the values of input/output language and input text that a user entered
    var inLang = inLanguageEl.children[1].children[0].value;
    var outLang = outLanguageEl.children[1].children[0].value;
    var inText = inTextEl.value.trim();

    console.log(inLang, outLang);
    console.log(inText);

    ////////////////////////////////////////////////////////////
    // Need to add function-call for the translation API here //
    ////////////////////////////////////////////////////////////
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

    fetch('https://google-translate1.p.rapidapi.com/language/translate/v2', options)
	.then(response => response.json())
	.then(response => console.log(response))
	.catch(err => console.error(err));
 
    // initialize input text value
    inTextEl.value = "";
}


