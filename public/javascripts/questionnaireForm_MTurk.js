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
    console.log('completed = ' + completed);

    let note = document.getElementById('noteArea');
    let firstParagraph = document.getElementById('firstParagraph');
    switch (completed) {
        case 0:
            note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because you had a bad internet connection or opened another window/tab during the decision-making task.</span></p><br>";
            firstParagraph.innerHTML = "<p class='lead'>Please answer the following questions on how you perceived this task. <br> The code needed to claim your payment will be shown on the next page.</p>";
            break;
        case "maxChoiceStageTimeOver":
            note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because you did not make a choice for 60 seconds.</span></p><br>";
            firstParagraph.innerHTML = "<p class='lead'>Please answer the following questions on how you perceived this task. <br> The code needed to claim your payment will be shown on the next page.</p>";
            break;
        case "browserHidden":
            note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because you opened another window/tab during the decision-making task.</span></p><br>";
            firstParagraph.innerHTML = "<p class='lead'>Please answer the following questions on how you perceived this task. <br> The code needed to claim your payment will be shown on the next page.</p>";
            break;
        case "technicalIssueInWaitingRoom":
            note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because of a technical issue in our program.</span> </p><br>";
            firstParagraph.innerHTML = "<p><span class='note'>Apologise for the inconvenience. Feel free to skip the following questionnaire and go directly to the next page to get your confirmation code.</span> </p>";
            break;
        case "droppedTestScene":
            note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because you did not answer the 'Understanding Instruction' questions within 4 minutes.</span></p><br>";
            firstParagraph.innerHTML = "<p class='lead'>Please answer the following questions on how you perceived this task. <br> The code needed to claim your payment will be shown on the next page.</p>";
            break;
        default:
            note.innerHTML = "";
            firstParagraph.innerHTML = "<p class='lead'>The decision-making task has been completed!<br> Please answer the following questions on how you perceived this task. <br> The code needed to claim your payment will be shown on the next page.</p>";
    }
    /*if(completed == 0){
    	note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because you had a bad internet connection or opened another window/tab during the decision-making task.</span></p><br>";
        firstParagraph.innerHTML = "<p class='lead'>Please answer the following questions on how you perceived this task. <br> The code needed to claim your payment will be shown on the next page.</p>";
    }else if (completed == "maxChoiceStageTimeOver") {
        note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because you did not make a choice for 60 seconds.</span></p><br>";
        firstParagraph.innerHTML = "<p class='lead'>Please answer the following questions on how you perceived this task. <br> The code needed to claim your payment will be shown on the next page.</p>";
    }else if (completed == "browserHidden") {
        note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because you opened another window/tab during the decision-making task.</span></p><br>";
        firstParagraph.innerHTML = "<p class='lead'>Please answer the following questions on how you perceived this task. <br> The code needed to claim your payment will be shown on the next page.</p>";
    }else if (completed == "technicalIssueInWaitingRoom") {
        note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because of a technical issue in our program.</span> </p><br>";
        firstParagraph.innerHTML = "<p><span class='note'>Apologise for the inconvenience. Feel free to skip the following questionnaire and go directly to the next page to get your confirmation code.</span> </p>";
    }else if (completed == "droppedTestScene") {
        note.innerHTML = "<p><span class='note'>You were redirected to this questionnaire because you did not answer the 'Understanding Instruction' questions within 4 minutes.</span></p><br>";
        firstParagraph.innerHTML = "<p class='lead'>Please answer the following questions on how you perceived this task. <br> The code needed to claim your payment will be shown on the next page.</p>";
    }else{
    	note.innerHTML = "";
        firstParagraph.innerHTML = "<p class='lead'>The decision-making task has been completed!<br> Please answer the following questions on how you perceived this task. <br> The code needed to claim your payment will be shown on the next page.</p>";
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
