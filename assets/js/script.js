var buttonEl = document.getElementById("translatebtn");
var inLanguageEl = document.getElementById("dropDown");
var outLanguageEl = document.getElementById("dropDownOutput");
var inTextEl = document.getElementById("inputText");

buttonEl.addEventListener("click", handleTranslateBtnEvent);

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

    // initialize input text value
    inTextEl.value = "";
}
