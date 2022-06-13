'use strict';

window.onload = function() {

	$("#amazonID").val(amazonID);
	$("#bonus_for_waiting").val(bonus_for_waiting); //cents
    $("#confirmationID").val(confirmationID);
    $("#totalEarning").val(totalEarning);
    $('#exp_condition').val(exp_condition);
    $('#indivOrGroup').val(indivOrGroup);
    $('#completed').val(completed);
    $('#latency').val(latency);

    /*console.log(amazonID);
    console.log(bonus_for_waiting);
    console.log(confirmationID);
    console.log(totalEarning);
    console.log(exp_condition);
    console.log(indivOrGroup);*/
    //console.log('completed = ' + completed);

    let note = document.getElementById('noteArea');
    let firstParagraph = document.getElementById('firstParagraph');
    let freeTextQ = document.getElementById('freeTextQuestion');
    switch (completed) {
        case 0:
            note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because of a technical error happened around the network connection. The payoffs you have earned thus far will be paid. Please answer the following questions and click the submit button. Cheers!</span></p><br>";
            firstParagraph.innerHTML = "<p class='lead'>Please answer the following questions on how you perceived this task. </p>";
            freeTextQ.innerHTML = "Q4: Your honest feedback would be a big help to develop our future experimental task.<br> For example, any idea if your internet connection worked well?"
            break;
        case '0':
            note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because of a technical error happened around the network connection. The payoffs you have earned thus far will be paid. Please answer the following questions and click the submit button. Cheers!</span></p><br>";
            firstParagraph.innerHTML = "<p class='lead'>Please answer the following questions on how you perceived this task. </p>";
            freeTextQ.innerHTML = "Q4: Your honest feedback would be a big help to develop our future experimental task.<br> For example, any idea if your internet connection worked well?"
            break;
        case "maxChoiceStageTimeOver":
            note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because you did not make a choice for 60 seconds.</span></p><br>";
            firstParagraph.innerHTML = "<p class='lead'>Please answer the following questions on how you perceived this task. </p>";
            freeTextQ.innerHTML = "Q4: Your honest feedback would be a big help to develop our future experimental task.<br> Please put any comments below if you fancy!"
            break;
        case "browserHidden":
            note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because you opened another window/tab during the decision-making task.</span></p><br>";
            firstParagraph.innerHTML = "<p class='lead'>Please answer the following questions on how you perceived this task. </p>";
            freeTextQ.innerHTML = "Q4: Your honest feedback would be a big help to develop our future experimental task.<br> Please put any comments below if you fancy!"
            break;
        case "technicalIssueInWaitingRoom":
            note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because of a technical issue in our program.</span> </p><br>";
            firstParagraph.innerHTML = "<p><span class='note'>Apologise for the inconvenience. Feel free to skip the following questionnaire and go directly to the next page to get your confirmation code.</span> </p>";
            freeTextQ.innerHTML = "Q4: Your honest feedback would be a big help to develop our future experimental task.<br> Please put any comments below if you fancy!"
            break;
        case "droppedTestScene":
            note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because you put the answer to the 'Comprehension quiz' incorrectly more than 3 times.</span></p><br>";
            firstParagraph.innerHTML = "<p class='lead'>Please answer the following questions on how you perceived this task. </p>";
            freeTextQ.innerHTML = "Q4: Your honest feedback would be a big help to develop our future experimental task.<br> Please put any comments below if you fancy!"
            break;
        default:
            note.innerHTML = "";
            firstParagraph.innerHTML = "<p class='lead'>The decision-making task has been completed!<br> Please answer the following questions on how you perceived this task. </p> <p class='lead'>Your answers will be recorded anonymously, being disconnected to your Prolific ID right after the entire experiment is done. </p>";
            freeTextQ.innerHTML = "Q4: While working on the task, what strategy (if any) did you use to maximize your total rewards? Please describe what you did in the form below: "
    }
    /*if(completed == 0){
    	note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because you had a bad internet connection or opened another window/tab during the decision-making task.</span></p><br>";
        firstParagraph.innerHTML = "<p class='lead'>Please answer the following questions on how you perceived this task. </p>";
    }else if (completed == "maxChoiceStageTimeOver") {
        note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because you did not make a choice for 60 seconds.</span></p><br>";
        firstParagraph.innerHTML = "<p class='lead'>Please answer the following questions on how you perceived this task. </p>";
    }else if (completed == "browserHidden") {
        note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because you opened another window/tab during the decision-making task.</span></p><br>";
        firstParagraph.innerHTML = "<p class='lead'>Please answer the following questions on how you perceived this task. </p>";
    }else if (completed == "technicalIssueInWaitingRoom") {
        note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because of a technical issue in our program.</span> </p><br>";
        firstParagraph.innerHTML = "<p><span class='note'>Apologise for the inconvenience. Feel free to skip the following questionnaire and go directly to the next page to get your confirmation code.</span> </p>";
    }else if (completed == "droppedTestScene") {
        note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because you did not answer the 'Understanding Instruction' questions within 4 minutes.</span></p><br>";
        firstParagraph.innerHTML = "<p class='lead'>Please answer the following questions on how you perceived this task. </p>";
    }else{
    	note.innerHTML = "";
        firstParagraph.innerHTML = "<p class='lead'>The decision-making task has been completed!<br> Please answer the following questions on how you perceived this task. </p>";
    }*/



	let proceed = document.getElementById('proceed');

	proceed.innerHTML = "<div class='btn2'><div id='connectBtn'>SUBMIT</div></div>";

	// after document was read
	//document.ready = function () {
	let connectBtn = document.getElementById('connectBtn');
		//connectBtn.addEventListener('click', goToExp('https://twitter.com/WataruToyokawa'), false);
	//}

	connectBtn.addEventListener('click', goToEndPage, false);

	function goToEndPage () {
		$("#form").submit();
	}
	
}
