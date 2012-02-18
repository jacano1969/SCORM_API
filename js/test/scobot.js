/*global $, JQuery, ok, module, test, strictEqual, equal, SCORM_API, SCOBot, debug, enableDebug, learner_name, learner_id, mode, local */
var scorm  = new SCORM_API({
				debug: true,
				exit_type: 'suspend',
				success_status: 'passed'
           }),
	SB     = new SCOBot({
				debug: true,
				exit_type: 'suspend',
				success_status: 'passed',
				interaction_mode: 'state'
           }),
	setvalue_calls = 0,
	getvalue_calls = 0;
$(scorm).on("setvalue", function(e) {
	setvalue_calls++;
	return false;
});
$(scorm).on("getvalue", function(e) {
	getvalue_calls++;
	return false;
});

// Much of SCOBOT is a bit auto-pilot so several SCORM calls may be made on one API reference.
module("SCOBOT");
// Debug
test("scorm.debug", function() {
	var sub_method = scorm.debug;
	ok(sub_method("Error Message", 1), "Valid error message");
	ok(sub_method("Warning Message", 2), "Valid warning message");
	ok(sub_method("General Message", 3), "Valid general message");
	ok(sub_method("Log Message", 4), "Valid log message");
	ok(!sub_method("Bogus Message", 5), "Invalid log message");
});

test("SCORM ISO 8601 Time", function() {
	strictEqual(SB.isISO8601UTC('2012-02-12T00:37:29Z'), true, 'Checking a UTC example 2012-02-12T00:37:29Z');
	strictEqual(SB.isISO8601UTC('2012-02-12T00:37:29'), false, 'Checking a non-UTC example 2012-02-12T00:37:29');
	strictEqual(SB.isISO8601UTC('2012-02-1200:37:29'), false, 'Checking a non-UTC example 2012-02-1200:37:29Z');
});

// SB.start is fired onload, nothing to really test here.  We could verify settings however.

test("SCORM Bookmarking", function() {
	strictEqual(SB.setBookmark(2), 'true', 'Setting Bookmark to 2');
	strictEqual(SB.getBookmark(), '2', 'Getting Bookmark, should be 2');
});

test("SCORM Objectives", function() {
	// For True False
	strictEqual(SB.setObjective({
		id: '1_1',
		score: {
			scaled: '0',
			raw: '0',
			min: '0',
			max: '1'
		},
		success_status: 'unknkown',
		completion_status: 'not attempted',
		progress_measure: '0',
		description: 'They will answer a true false interaction'
	}), 'true', "Setting Objective True False 1_1 unscored");
	// For Multiple Choice
	strictEqual(SB.setObjective({
		id: '2_1',
		score: {
			scaled: '0',
			raw: '0',
			min: '0',
			max: '1'
		},
		success_status: 'unknkown',
		completion_status: 'not attempted',
		progress_measure: '0',
		description: 'They will answer a multiple choice interaction'
	}), 'true', "Setting Objective Multiple Choice 2_1 unscored");
	// For Fill In
	strictEqual(SB.setObjective({
		id: '3_1',
		score: {
			scaled: '0',
			raw: '0',
			min: '0',
			max: '1'
		},
		success_status: 'unknkown',
		completion_status: 'not attempted',
		progress_measure: '0',
		description: 'They will answer a fill in interaction'
	}), 'true', "Setting Objective Fill In 3_1 unscored");
	// For Sequencing
	strictEqual(SB.setObjective({
		id: '4_1',
		score: {
			scaled: '0',
			raw: '0',
			min: '0',
			max: '1'
		},
		success_status: 'unknkown',
		completion_status: 'not attempted',
		progress_measure: '0',
		description: 'They will answer a sequencing interaction'
	}), 'true', "Setting Objective Sequencing 4_1 unscored");
	// For Long Fill In
	strictEqual(SB.setObjective({
		id: '5_1',
		score: {
			scaled: '0',
			raw: '0',
			min: '0',
			max: '1'
		},
		success_status: 'unknkown',
		completion_status: 'not attempted',
		progress_measure: '0',
		description: 'They will answer a long fill in interaction'
	}), 'true', "Setting Objective Sequencing 5_1 unscored");
	// For Matching
	strictEqual(SB.setObjective({
		id: '6_1',
		score: {
			scaled: '0',
			raw: '0',
			min: '0',
			max: '1'
		},
		success_status: 'unknkown',
		completion_status: 'not attempted',
		progress_measure: '0',
		description: 'They will answer a matching interaction'
	}), 'true', "Setting Objective Sequencing 6_1 unscored");
	// For LikeRT
	strictEqual(SB.setObjective({
		id: '7_1',
		score: {
			scaled: '0',
			raw: '0',
			min: '0',
			max: '1'
		},
		success_status: 'unknkown',
		completion_status: 'not attempted',
		progress_measure: '0',
		description: 'They will answer a likert interaction'
	}), 'true', "Setting Objective Sequencing 7_1 unscored");
	// For Other
	strictEqual(SB.setObjective({
		id: '8_1',
		score: {
			scaled: '0',
			raw: '0',
			min: '0',
			max: '1'
		},
		success_status: 'unknkown',
		completion_status: 'not attempted',
		progress_measure: '0',
		description: 'They will answer a other interaction'
	}), 'true', "Setting Objective Sequencing 8_1 unscored");
});

test("SCORM Interactions", function() {
	var startTime = new Date(),
		endTime   = new Date(startTime),
		intID     = '1',
		objID     = '1_1',
		n         = '', // for interaction.n Array value (locator)
		m         = ''; // for Interaction.n.objective.m array value (locator)
	endTime.setMinutes(startTime.getMinutes() + 5); // Add 5 minutes for latency, result would be PT5M
	
	// True False Interaction
	strictEqual(SB.setInteraction({
		id: intID,
		type: 'true_false',
		objectives: [
			{
				id: objID
			}
		],
		timestamp: startTime, // Snapshot of time at beginning of interaction
		correct_responses: [
			{
				pattern: 'true'
			}
		],
		weighting: '1',
		learner_response: 'true',  // tile_1[.]target_2
		result: 'correct',
		latency: endTime,   // Snapshot of time at the end of the interaction (optional)
		description: 'This is the question?'
	}), 'true', "Setting true/false Interaction 1");
	
	// Verify Data was set properly, I'm using long-hand scorm calls for this
	n = scorm.getInteractionByID(intID);
	m = scorm.getInteractionObjectiveByID(n, objID);
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.type'), 'true_false', 'Verifying cmi.interactions.'+n+'.type is true_false');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.objectives._count'), '1', 'Verifying cmi.interactions.'+n+'.objectives._count count is 1');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.objectives.'+m+'.id'), '1_1', 'Verifying cmi.interactions.'+n+'.objectives.'+m+'.id id is 1_1');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.learner_response'), 'true', 'Verifying cmi.interactions.'+n+'.learner_response is true');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.result'), 'correct', 'Verifying cmi.interactions.'+n+'.result is correct');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.latency'), 'PT5M', 'Verifying cmi.interactions.'+n+'.latency is PT5M');
	// End True False Interaction
	
	// Multiple Choice Interaction
	intID = '2';
	objID = '2_1';
	//endTime.setMinutes(startTime.getMinutes() + 10); // Add 5 minutes for latency, result would be PT10M
	strictEqual(SB.setInteraction({
		id: intID,
		type: 'multiple_choice',
		objectives: [
			{
				id: objID
			}
		],
		timestamp: startTime, // Snapshot of time at beginning of interaction
		correct_responses: [
			{
				pattern: ["a","b"] // {Array}
			}
		],
		weighting: '1',
		learner_response: ["a","c"],  // {Array}
		result: 'incorrect',
		latency: endTime,   // Snapshot of time at the end of the interaction (optional)
		description: 'Which choices would <b>you</b> pick?'
	}), 'true', "Setting multiple choice Interaction 2");
	
	// Verify Data was set properly, I'm using long-hand scorm calls for this
	n = scorm.getInteractionByID(intID);
	m = scorm.getInteractionObjectiveByID(n, objID);
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.type'), 'multiple_choice', 'Verifying cmi.interactions.'+n+'.type is multiple_choice');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.objectives._count'), '1', 'Verifying cmi.interactions.'+n+'.objectives._count count is 1');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.objectives.'+m+'.id'), '2_1', 'Verifying cmi.interactions.'+n+'.objectives.'+m+'.id id is 2_1');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.learner_response'), 'a[,]c', 'Verifying cmi.interactions.'+n+'.learner_response is a[,]c');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.result'), 'incorrect', 'Verifying cmi.interactions.'+n+'.result is incorrect');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.latency'), 'PT5M', 'Verifying cmi.interactions.'+n+'.latency is PT5M');
	// End Multiple Choice Interaction
	
	// Fill In Interaction
	intID = '3';
	objID = '3_1';
	//endTime.setMinutes(startTime.getMinutes() + 11); // Add 5 minutes for latency, result would be PT10M
	strictEqual(SB.setInteraction({
		id: intID,
		type: 'fill_in',
		objectives: [
			{
				id: objID
			}
		],
		timestamp: startTime, // Snapshot of time at beginning of interaction
		correct_responses: [
			{
				pattern: {  // {Object}
					case_matters: true,
					order_matters: true,
					lang: 'en',
					words: ["car","automobile"]
				}
			}
		],
		weighting: '1',
		learner_response: {  // {Object}
			lang: 'en',
			words:["car","automobile"]
		},
		result: 'correct',
		latency: endTime,   // Snapshot of time at the end of the interaction (optional)
		description: 'Which choices would <b>you</b> pick?'
	}), 'true', "Setting Fill In Interaction 3");
	
	// Verify Data was set properly, I'm using long-hand scorm calls for this
	n = scorm.getInteractionByID(intID);
	m = scorm.getInteractionObjectiveByID(n, objID);
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.type'), 'fill_in', 'Verifying cmi.interactions.'+n+'.type is fill_in');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.objectives._count'), '1', 'Verifying cmi.interactions.'+n+'.objectives._count count is 1');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.objectives.'+m+'.id'), '3_1', 'Verifying cmi.interactions.'+n+'.objectives.'+m+'.id id is 3_1');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.learner_response'), '{lang=en}car[,]automobile', 'Verifying cmi.interactions.'+n+'.learner_response is {lang=en}car[,]automobile');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.result'), 'correct', 'Verifying cmi.interactions.'+n+'.result is correct');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.latency'), 'PT5M', 'Verifying cmi.interactions.'+n+'.latency is PT5M');
	// End Fill In Interaction
	
	// Sequencing Interaction
	intID = '4';
	objID = '4_1';
	//endTime.setMinutes(startTime.getMinutes() + 15); // Add 5 minutes for latency, result would be PT10M
	strictEqual(SB.setInteraction({
		id: intID,
		type: 'sequencing',
		objectives: [
			{
				id: objID
			}
		],
		timestamp: startTime, // Snapshot of time at beginning of interaction
		correct_responses: [
			{
				pattern: ["c","b", "a"] // {Array}
			}
		],
		weighting: '1',
		learner_response: ["a","c","b"],  // {Array}
		result: 'incorrect',
		latency: endTime,   // Snapshot of time at the end of the interaction (optional)
		description: 'Place these options in order'
	}), 'true', "Setting sequencing Interaction 4");
	
	// Verify Data was set properly, I'm using long-hand scorm calls for this
	n = scorm.getInteractionByID(intID);
	m = scorm.getInteractionObjectiveByID(n, objID);
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.type'), 'sequencing', 'Verifying cmi.interactions.'+n+'.type is sequencing');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.objectives._count'), '1', 'Verifying cmi.interactions.'+n+'.objectives._count count is 1');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.objectives.'+m+'.id'), '4_1', 'Verifying cmi.interactions.'+n+'.objectives.'+m+'.id id is 4_1');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.learner_response'), 'a[,]c[,]b', 'Verifying cmi.interactions.'+n+'.learner_response is a[,]c[,]b');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.result'), 'incorrect', 'Verifying cmi.interactions.'+n+'.result is incorrect');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.latency'), 'PT5M', 'Verifying cmi.interactions.'+n+'.latency is PT5M');
	// End Sequencing Interaction
	
	// Long Fill In Interaction
	intID = '5';
	objID = '5_1';
	//endTime.setMinutes(startTime.getMinutes() + 21); // Add 5 minutes for latency, result would be PT10M
	strictEqual(SB.setInteraction({
		id: intID,
		type: 'long_fill_in',
		objectives: [
			{
				id: objID
			}
		],
		timestamp: startTime, // Snapshot of time at beginning of interaction
		correct_responses: [
			{
				pattern: {  // {Object}
					lang: 'en',
					case_matters: false,
					text: "it's been a long day"
				}
			}
		],
		weighting: '1',
		learner_response: {  // {Object}
			lang: 'en',
			text: "There was one once, but it's been a long day."
		},
		result: 'correct',
		latency: endTime,   // Snapshot of time at the end of the interaction (optional)
		description: 'Which choices would <b>you</b> pick?'
	}), 'true', "Setting long fill in Interaction 5");
	
	// Verify Data was set properly, I'm using long-hand scorm calls for this
	n = scorm.getInteractionByID(intID);
	m = scorm.getInteractionObjectiveByID(n, objID);
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.type'), 'long_fill_in', 'Verifying cmi.interactions.'+n+'.type is long_fill_in');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.objectives._count'), '1', 'Verifying cmi.interactions.'+n+'.objectives._count count is 1');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.objectives.'+m+'.id'), '5_1', 'Verifying cmi.interactions.'+n+'.objectives.'+m+'.id id is 5_1');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.learner_response'), "{lang=en}There was one once, but it's been a long day.", "Verifying cmi.interactions."+n+".learner_response is {lang=en}There was one once, but it's been a long day.");
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.result'), 'correct', 'Verifying cmi.interactions.'+n+'.result is correct');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.latency'), 'PT5M', 'Verifying cmi.interactions.'+n+'.latency is PT5M');
	// End Long Fill In Choice Interaction
	
	// Matching Interaction
	intID = '6';
	objID = '6_1';
	//endTime.setMinutes(startTime.getMinutes() + 15); // Add 5 minutes for latency, result would be PT10M
	strictEqual(SB.setInteraction({
		id: intID,
		type: 'matching',
		objectives: [
			{
				id: objID
			}
		],
		timestamp: startTime, // Snapshot of time at beginning of interaction
		correct_responses: [
			{
				pattern: [  // {Array}
					["tile_1", "target_2"],
					["tile_2", "target_1"],
					["tile_3", "target_3"]
				]
			}
		],
		weighting: '1',
		learner_response: [ // Array
					["tile_1", "target_2"],
					["tile_2", "target_1"],
					["tile_3", "target_3"]
				],
		result: 'correct',
		latency: endTime,   // Snapshot of time at the end of the interaction (optional)
		description: "Place these steps over the matching order you'd do them."
	}), 'true', "Setting matching Interaction 6");
	
	// Verify Data was set properly, I'm using long-hand scorm calls for this
	n = scorm.getInteractionByID(intID);
	m = scorm.getInteractionObjectiveByID(n, objID);
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.type'), 'matching', 'Verifying cmi.interactions.'+n+'.type is matching');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.objectives._count'), '1', 'Verifying cmi.interactions.'+n+'.objectives._count count is 1');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.objectives.'+m+'.id'), '6_1', 'Verifying cmi.interactions.'+n+'.objectives.'+m+'.id id is 6_1');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.learner_response'), 'tile_1[.]target_2[,]tile_2[.]target_1[,]tile_3[.]target_3', 'Verifying cmi.interactions.'+n+'.learner_response is tile_1[.]target_2[,]tile_2[.]target_1[,]tile_3[.]target_3');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.result'), 'correct', 'Verifying cmi.interactions.'+n+'.result is correct');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.latency'), 'PT5M', 'Verifying cmi.interactions.'+n+'.latency is PT5M');
	// End Matching Interaction
	
	// LikeRT Interaction
	intID = '7';
	objID = '7_1';
	//endTime.setMinutes(startTime.getMinutes() + 15); // Add 5 minutes for latency, result would be PT10M
	strictEqual(SB.setInteraction({
		id: intID,
		type: 'likert',
		objectives: [
			{
				id: objID
			}
		],
		timestamp: startTime, // Snapshot of time at beginning of interaction
		correct_responses: [
			{
				pattern: "strongly_agree" // {String}
			},
			{
				pattern: "agree" // {String}
			},
			{
				pattern: "disagree" // {String}
			},
			{
				pattern: "strongly_disagree" // {String}
			}
		],
		weighting: '1',
		learner_response: "strongly_agree", // {String} commonly a unique identifier for the group
		result: 'correct',
		latency: endTime,   // Snapshot of time at the end of the interaction (optional)
		description: "Do you like filling in surveys?"
	}), 'true', "Setting likert Interaction 7");
	
	// Verify Data was set properly, I'm using long-hand scorm calls for this
	n = scorm.getInteractionByID(intID);
	m = scorm.getInteractionObjectiveByID(n, objID);
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.type'), 'likert', 'Verifying cmi.interactions.'+n+'.type is likert');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.objectives._count'), '1', 'Verifying cmi.interactions.'+n+'.objectives._count count is 1');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.objectives.'+m+'.id'), '7_1', 'Verifying cmi.interactions.'+n+'.objectives.'+m+'.id id is 7_1');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.learner_response'), 'strongly_agree', 'Verifying cmi.interactions.'+n+'.learner_response is strongly_agree');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.result'), 'correct', 'Verifying cmi.interactions.'+n+'.result is correct');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.latency'), 'PT5M', 'Verifying cmi.interactions.'+n+'.latency is PT5M');
	// End LikeRT Interaction
	
	// LikeRT Interaction
	intID = '8';
	objID = '8_1';
	//endTime.setMinutes(startTime.getMinutes() + 15); // Add 5 minutes for latency, result would be PT10M
	strictEqual(SB.setInteraction({
		id: intID,
		type: 'other',
		objectives: [
			{
				id: objID
			}
		],
		timestamp: startTime, // Snapshot of time at beginning of interaction
		correct_responses: [
			{
				pattern: "Anything we want." // {String}
			},
			{
				pattern: "Almost anything." // {String}
			},
			{
				pattern: "Everything." // {String}
			},
			{
				pattern: "A ton of stuff!" // {String}
			}
		],
		weighting: '1',
		learner_response: "Anything we want.", // {String} commonly a unique identifier for the group
		result: 'correct',
		latency: endTime,   // Snapshot of time at the end of the interaction (optional)
		description: "What can we put in the 'other' interaction type?"
	}), 'true', "Setting other Interaction 8");
	
	// Verify Data was set properly, I'm using long-hand scorm calls for this
	n = scorm.getInteractionByID(intID);
	m = scorm.getInteractionObjectiveByID(n, objID);
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.type'), 'other', 'Verifying cmi.interactions.'+n+'.type is other');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.objectives._count'), '1', 'Verifying cmi.interactions.'+n+'.objectives._count count is 1');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.objectives.'+m+'.id'), '8_1', 'Verifying cmi.interactions.'+n+'.objectives.'+m+'.id id is 8_1');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.learner_response'), 'Anything we want.', 'Verifying cmi.interactions.'+n+'.learner_response is Anything we want.');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.result'), 'correct', 'Verifying cmi.interactions.'+n+'.result is correct');
	strictEqual(scorm.getvalue('cmi.interactions.'+n+'.latency'), 'PT5M', 'Verifying cmi.interactions.'+n+'.latency is PT5M');
	// End Other Interaction
});

test("SCORM Set Suspend Data By Page ID", function() {
	var result,
		answer_arr = ["a","b","c","d"],
		images_arr = ["bird.png", "bug.png", "helicopter.png"];
	// Save Suspend Data for Page 1
	strictEqual(SB.setSuspendDataByPageID(1, 'Sample Data 1', {
		answers: answer_arr,
		question: "This <b>is</b> the question?",
		numtries: 2
	}), 'true', 'Setting some sample suspend data for page 1');
	// Verify saved Suspend Data for Page 1
	result = SB.getSuspendDataByPageID(1);
	strictEqual(result.answers, answer_arr, "Verify answers: ['a','b','c','d']");
	strictEqual(result.question, 'This <b>is</b> the question?', 'Verify question: This <b>is</b> the question?');
	strictEqual(result.numtries, 2, 'Verify numtries: 2');
	// End Test 1
	// Save Suspend Data for Page 2
	strictEqual(SB.setSuspendDataByPageID(2, 'Sample Data 2', {
		short_answer: "This is a short answer with text they typed in.",
		question: "How did you feel about the question?",
		images: images_arr
	}), 'true', 'Setting some sample suspend data for page 2');
	// Verify saved Suspend Data for Page 4
	result = SB.getSuspendDataByPageID(2);
	strictEqual(result.short_answer, 'This is a short answer with text they typed in.', 'Verify short_answer: This is a short answer with text they typed in.');
	strictEqual(result.question, 'How did you feel about the question?', 'Verify question: How did you feel about the question?');
	strictEqual(result.images, images_arr, "Verify answers: ['bird.png', 'bug.png', 'helicopter.png']");
	// End Test 2
});

test("SCORM Suspend SCO", function() {
	strictEqual(SB.suspend(), 'true', 'Suspending SCO');
	scorm.debug("SetValue Calls: " + setvalue_calls + "\nGetValue Calls: " + getvalue_calls, 4);
});