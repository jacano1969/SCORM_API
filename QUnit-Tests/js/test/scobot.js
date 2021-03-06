/*global $, JQuery, ok, module, test, strictEqual, equal, SCORM_API, SCOBot, debug, enableDebug, learner_name, learner_id */
QUnit.config.reorder = false;
var scorm = new SCORM_API({
		debug:          true,
		throw_alerts:   false,
		time_type:      'GMT',
		exit_type:      'suspend',
		success_status: 'unknown'
	}),
	SB = new SCOBot({
		interaction_mode: 'state',
		launch_data_type: 'querystring'
	}),
	entry = 'ab-initio',
	version = '1.0',
	local = false,
	setvalue_calls = 0,
	getvalue_calls = 0,
// These things tend to happen during authoring/creation. We'll use this later to put into suspend data
	character_str = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ˜‌‍‎‏–—―‗‘’‚‛“”„†‡•…‰′″‹›‼‾⁄₣₤₧₪₫€℅ℓ№™Ω℮⅓⅔⅛⅜⅝⅞←↑→↓∂√∞∩∫≠≡■□▲△▼○●♀♂♪";
$(scorm).on("setvalue", function (e) {
	setvalue_calls += 1;
});
$(scorm).on("getvalue", function (e) {
	getvalue_calls += 1;
});
$(scorm).on("StoreData", function(e) {
	"use strict";
	SB.debug("Call to Store Data was made.", 3);
	SB.debug(e.runtimedata);
});

// Much of SCOBOT is a bit auto-pilot so several SCORM calls may be made on one API reference.
module("SCOBot");
// Debug
test("SB.debug", function () {
	"use strict";
	var sub_method = SB.debug;
	ok(sub_method("Error Message", 1), "Valid error message");
	ok(sub_method("Warning Message", 2), "Valid warning message");
	ok(sub_method("General Message", 3), "Valid general message");
	ok(sub_method("Log Message", 4), "Valid log message");
	ok(!sub_method("Bogus Message", 5), "Invalid log message");
});

test("ISO 8601 UTC Time", function () {
	scorm.set("time_type", "UTC");
	strictEqual(SB.isISO8601('2012-02-12T00:37:29.0Z'), true, 'Checking a UTC example 2012-02-12T00:37:29.0Z');
	strictEqual(SB.isISO8601('2012-02-12T00:37:29'), false, 'Checking a non-UTC example 2012-02-12T00:37:29');
	strictEqual(SB.isISO8601('2012-02-1200:37:29'), false, 'Checking a malformed example 2012-02-1200:37:29');
});
test("ISO 8601 Time", function () {
// non UTC (This was all I could get to work con cloud.scorm.com)
	scorm.set("time_type", "");
	strictEqual(SB.isISO8601('2012-02-27T15:33:08'), true, 'Checking a non-UTC example 2012-02-27T15:33:08');
	strictEqual(SB.isISO8601('2012-02-1200:37:29'), false, 'Checking a malformed example 2012-02-1200:37:29');
	strictEqual(SB.isISO8601('2012-02-12T00:37:29Z'), false, 'Checking a UTC example 2012-02-12T00:37:29Z');
	// GMT
	scorm.set("time_type", "GMT");
	strictEqual(SB.isISO8601('2009-03-24T16:24:32.5+01:00'), true, 'Checking a GMT example 2009-03-24T16:24:32.5+01:00');
	strictEqual(SB.isISO8601('2012-02-27T15:33:08.08:00'), false, 'Checking a GMT example 2012-02-27T15:33:08.08:00');
	//strictEqual(scorm.isoStringToDate('2012-03-20T10:47:54.0-07:00'), 'March 20, 2012 - 10:47PM', "Checking ISO String back to date");
	var date = scorm.isoStringToDate('2012-03-20T10:47:54.0-07:00');
	strictEqual(String(date), 'Tue Mar 20 2012 10:47:54 GMT-0700 (PDT)', 'Checking ISO8601 String to Date equals - Tue Mar 20 2012 10:47:54 GMT-0700 (PDT)');
});
test("Set Totals", function () {
	"use strict";
	strictEqual(SB.setTotals({
		totalInteractions: '10',
		totalObjectives:   '10',
		scoreMin:          '0',
		scoreMax:          '16.083'
	}), 'true', 'Setting SCO totals');
	// Based on Entry we may be able to tell if we've been ran before.
	SB.debug(">>>>>>>>> TOTALS SET <<<<<<<<<");
	version = SB.getvalue('cmi._version');
	local = version === "Local 1.0";
});
test("LMS Connected", function() {
	if (local) {
		strictEqual(scorm.isLMSConnected(), false, 'Local enabled, should not find a LMS.');
	} else {
		strictEqual(scorm.isLMSConnected(), true, 'Local disabled, should find a LMS.');
	}
});
// SB.start is fired onload, nothing to really test here.  We could verify settings however.
test("Mode", function () {
	strictEqual(SB.getMode(), 'normal', "Checking that Mode is normal");
});

test("Bookmarking", function () {
	if (local) {
		// There would be no bookmark unless one was manually set
		strictEqual(SB.setBookmark(2), 'true', 'Setting Bookmark to 2');
		strictEqual(SB.getBookmark(), '2', 'Getting Bookmark, should be 2');
	} else {
		if (SB.getEntry() === "resume") {
			strictEqual(SB.getBookmark(), '2', 'Getting Bookmark, should be 2');
		} else {
			strictEqual(SB.setBookmark(2), 'true', 'Setting Bookmark to 2');
			strictEqual(SB.getBookmark(), '2', 'Getting Bookmark, should be 2');
		}
	}
});

test("Max Time Allowed", function() {
	var max_time_allowed = SB.getvalue('cmi.max_time_allowed');
	strictEqual(max_time_allowed, '', "Checking max time allowed ('')");
	// Note, if you update the CAM to pass imsss:attemptAbsoluteDurationLimit please update this test!
});

test("Comments from LMS", function () {
	strictEqual(SB.getvalue('cmi.comments_from_lms._count'), '0', "Getting Comments from LMS count '0'");
	// UPDATE YOUR TESTS HERE IF YOU INTEND TO CHECK FOR COMMENTS
});

test("Check Comments from Learner", function () {
	var learner_comment_count = SB.getvalue('cmi.comments_from_learner._count');
	if (SB.getEntry() !== "resume") {
		// Verify previous comments
		strictEqual(learner_comment_count, '0', "Getting Comments from Learner count '0'");
	} else {
		scorm.debug(SB.getSuspendDataByPageID(3));
		var bookmarkCount = SB.getSuspendDataByPageID(3).fromLearner; // pull last suspended count to compare
		strictEqual(learner_comment_count, bookmarkCount, "Getting Comments from Learner count " + bookmarkCount); // this is getting set each visit aka resume attempt.
	}
});

test("Set Comment from Learner", function() {
	var commentTime = new Date();
	strictEqual(SB.setCommentFromLearner("This is a comment from learner", "QUnit Test", commentTime), 'true', "Setting comment from learner.");
	// Expand later if you like, but please update the expected count above.
	// Increment the stored counter so on resume after several comments it can be evaluated for correctness.
	SB.setSuspendDataByPageID(3, 'countTracker', {
		fromLearner: SB.getvalue('cmi.comments_from_learner._count')
	});
});

test("Objectives", function () {
	var objective;
	if (SB.getEntry() !== "resume") {
		SB.debug(">>>>>>>>> Setting Objective(s) <<<<<<<<<");
		//SB.debug("Get objective count before the fun begins.... " + SB.getvalue('cmi.objectives._count'));
		strictEqual(SB.getvalue('cmi.objectives._count'), '0', "Getting objective._count, should be '0'");
		// For True False
		strictEqual(SB.setObjective({
			id:       '1_1', // {String}
			score:             {                                                     // {Object}
				scaled: '0', // {String}
				raw:    '0', // {String}
				min:    '0', // {String}
				max:    '1.5'                                               // {String}
			},
			success_status:    'unknown', // {String} passed, failed, unknown
			completion_status: 'not attempted', // {String} completed, incomplete, not attempted
			progress_measure:  '0', // {String}
			description:       'They will answer a true false interaction'     // {String}
		}), 'true', "Setting Objective True False 1_1 unscored");
		// For Multiple Choice
		strictEqual(SB.setObjective({
			id:                '2_1',
			score:             {
				scaled: '0',
				raw:    '0',
				min:    '0',
				max:    '2'
			},
			success_status:    'unknown',
			completion_status: 'not attempted',
			progress_measure:  '0',
			description:       'They will answer a multiple choice interaction'
		}), 'true', "Setting Objective Multiple Choice 2_1 unscored");
		// For Fill In
		strictEqual(SB.setObjective({
			id:                '3_1',
			score:             {
				scaled: '0',
				raw:    '0',
				min:    '0',
				max:    '5.25'
			},
			success_status:    'unknown',
			completion_status: 'not attempted',
			progress_measure:  '0',
			description:       'They will answer a fill in interaction'
		}), 'true', "Setting Objective Fill In 3_1 unscored");
		// For Sequencing
		strictEqual(SB.setObjective({
			id:                '4_1',
			score:             {
				scaled: '0',
				raw:    '0',
				min:    '0',
				max:    '1.333'
			},
			success_status:    'unknown',
			completion_status: 'not attempted',
			progress_measure:  '0',
			description:       'They will answer a sequencing interaction'
		}), 'true', "Setting Objective Sequencing 4_1 unscored");
		// For Long Fill In
		strictEqual(SB.setObjective({
			id:                '5_1',
			score:             {
				scaled: '0',
				raw:    '0',
				min:    '0',
				max:    '1'
			},
			success_status:    'unknown',
			completion_status: 'not attempted',
			progress_measure:  '0',
			description:       'They will answer a long fill in interaction'
		}), 'true', "Setting Objective Long Fill In 5_1 unscored");
		// For Matching
		strictEqual(SB.setObjective({
			id:                '6_1',
			score:             {
				scaled: '0',
				raw:    '0',
				min:    '0',
				max:    '1'
			},
			success_status:    'unknown',
			completion_status: 'not attempted',
			progress_measure:  '0',
			description:       'They will answer a matching interaction'
		}), 'true', "Setting Objective Matching 6_1 unscored");
		// For LikeRT
		strictEqual(SB.setObjective({
			id:                '7_1',
			score:             {
				scaled: '0',
				raw:    '0',
				min:    '0',
				max:    '1'
			},
			success_status:    'unknown',
			completion_status: 'not attempted',
			progress_measure:  '0',
			description:       'They will answer a likert interaction'
		}), 'true', "Setting Objective LikeRT 7_1 unscored");
		// For Other
		strictEqual(SB.setObjective({
			id:                '8_1',
			score:             {
				scaled: '0',
				raw:    '0',
				min:    '0',
				max:    '1'
			},
			success_status:    'unknown',
			completion_status: 'not attempted',
			progress_measure:  '0',
			description:       'They will answer a other interaction'
		}), 'true', "Setting Objective Other 8_1 unscored");
		// For Performance
		strictEqual(SB.setObjective({
			id:                '9_1',
			score:             {
				scaled: '0',
				raw:    '0',
				min:    '0',
				max:    '1'
			},
			success_status:    'unknown',
			completion_status: 'not attempted',
			progress_measure:  '0',
			description:       'They will answer a performance interaction'
		}), 'true', "Setting Objective Performance 8_1 unscored");
		// For Numeric
		strictEqual(SB.setObjective({
			id:                '10_1',
			score:             {
				scaled: '0',
				raw:    '0',
				min:    '0',
				max:    '1'
			},
			success_status:    'unknown',
			completion_status: 'not attempted',
			progress_measure:  '0',
			description:       'They will answer a numeric interaction'
		}), 'true', "Setting Objective Numeric 8_1 unscored");
		strictEqual(SB.getvalue('cmi.objectives._count'), '10', "Getting objective._count, should be '10'");
		SB.debug(">>>>>>>>> End Setting Objective(s) <<<<<<<<<");
		SB.debug(">>>>>>>>> Verify Objective(s) <<<<<<<<<");
		// Verify These 
		objective = SB.getObjective('1_1');
		strictEqual(objective.id, "1_1", "Verify Objective id is 1_1");
		strictEqual(objective.score.scaled, "0", "Verify Objective score.scaled is 0");
		strictEqual(objective.score.raw, "0", "Verify Objective score raw is '0'");
		strictEqual(objective.score.min, "0", "Verify Objective score min is '0'");
		strictEqual(objective.score.max, "1.5", "Verify Objective score max is '1.5'");
		strictEqual(objective.success_status, "unknown", "Verify Objective success_status is 'unknown'");
		strictEqual(objective.completion_status, "not attempted", "Verify Objective completion_status is 'not attempted'");
		strictEqual(objective.progress_measure, "0", "Verify Objective progress_measure is '0'");
		strictEqual(objective.description, "They will answer a true false interaction", "Verify Objective description is They will answer a true false interaction");

		objective = SB.getObjective('2_1');
		strictEqual(objective.id, "2_1", "Verify Objective id is 2_1");
		strictEqual(objective.score.scaled, "0", "Verify Objective score.scaled is '0'");
		strictEqual(objective.score.raw, "0", "Verify Objective score raw is '0'");
		strictEqual(objective.score.min, "0", "Verify Objective score min is '0'");
		strictEqual(objective.score.max, "2", "Verify Objective score max is '2'");
		strictEqual(objective.success_status, "unknown", "Verify Objective success_status is 'unknown'");
		strictEqual(objective.completion_status, "not attempted", "Verify Objective completion_status is 'not attempted'");
		strictEqual(objective.progress_measure, "0", "Verify Objective progress_measure is '0'");
		strictEqual(objective.description, "They will answer a multiple choice interaction", "Verify Objective description is They will answer a multiple choice interaction");

		objective = SB.getObjective('3_1');
		strictEqual(objective.id, "3_1", "Verify Objective id is 3_1");
		strictEqual(objective.score.scaled, "0", "Verify Objective score.scaled is '0'");
		strictEqual(objective.score.raw, "0", "Verify Objective score raw is '0'");
		strictEqual(objective.score.min, "0", "Verify Objective score min is '0'");
		strictEqual(objective.score.max, "5.25", "Verify Objective score max is '5.25'");
		strictEqual(objective.success_status, "unknown", "Verify Objective success_status is 'unknown'");
		strictEqual(objective.completion_status, "not attempted", "Verify Objective completion_status is 'not attempted'");
		strictEqual(objective.progress_measure, "0", "Verify Objective progress_measure is '0'");
		strictEqual(objective.description, "They will answer a fill in interaction", "Verify Objective description is They will answer a fill in interaction");

		objective = SB.getObjective('4_1');
		strictEqual(objective.id, "4_1", "Verify Objective id is 4_1");
		strictEqual(objective.score.scaled, "0", "Verify Objective score.scaled is '0'");
		strictEqual(objective.score.raw, "0", "Verify Objective score raw is '0'");
		strictEqual(objective.score.min, "0", "Verify Objective score min is '0'");
		strictEqual(objective.score.max, "1.333", "Verify Objective score max is '1.333'");
		strictEqual(objective.success_status, "unknown", "Verify Objective success_status is 'unknown'");
		strictEqual(objective.completion_status, "not attempted", "Verify Objective completion_status is 'not attempted'");
		strictEqual(objective.progress_measure, "0", "Verify Objective progress_measure is '0'");
		strictEqual(objective.description, "They will answer a sequencing interaction", "Verify Objective description is They will answer a sequencing interaction");

		objective = SB.getObjective('5_1');
		strictEqual(objective.id, "5_1", "Verify Objective id is 5_1");
		strictEqual(objective.score.scaled, "0", "Verify Objective score.scaled is '0'");
		strictEqual(objective.score.raw, "0", "Verify Objective score raw is '0'");
		strictEqual(objective.score.min, "0", "Verify Objective score min is '0'");
		strictEqual(objective.score.max, "1", "Verify Objective score max is '1'");
		strictEqual(objective.success_status, "unknown", "Verify Objective success_status is 'unknown'");
		strictEqual(objective.completion_status, "not attempted", "Verify Objective completion_status is 'not attempted'");
		strictEqual(objective.progress_measure, "0", "Verify Objective progress_measure is '0'");
		strictEqual(objective.description, "They will answer a long fill in interaction", "Verify Objective description is They will answer a long fill in interaction");

		objective = SB.getObjective('6_1');
		strictEqual(objective.id, "6_1", "Verify Objective id is 6_1");
		strictEqual(objective.score.scaled, "0", "Verify Objective score.scaled is '0'");
		strictEqual(objective.score.raw, "0", "Verify Objective score raw is '0'");
		strictEqual(objective.score.min, "0", "Verify Objective score min is '0'");
		strictEqual(objective.score.max, "1", "Verify Objective score max is '1'");
		strictEqual(objective.success_status, "unknown", "Verify Objective success_status is 'unknown'");
		strictEqual(objective.completion_status, "not attempted", "Verify Objective completion_status is 'not attempted'");
		strictEqual(objective.progress_measure, "0", "Verify Objective progress_measure is '0'");
		strictEqual(objective.description, "They will answer a matching interaction", "Verify Objective description is They will answer a matching interaction");

		objective = SB.getObjective('7_1');
		strictEqual(objective.id, "7_1", "Verify Objective id is 7_1");
		strictEqual(objective.score.scaled, "0", "Verify Objective score.scaled is '0'");
		strictEqual(objective.score.raw, "0", "Verify Objective score raw is '0'");
		strictEqual(objective.score.min, "0", "Verify Objective score min is '0'");
		strictEqual(objective.score.max, "1", "Verify Objective score max is '1'");
		strictEqual(objective.success_status, "unknown", "Verify Objective success_status is 'unknown'");
		strictEqual(objective.completion_status, "not attempted", "Verify Objective completion_status is 'not attempted'");
		strictEqual(objective.progress_measure, "0", "Verify Objective progress_measure is '0'");
		strictEqual(objective.description, "They will answer a likert interaction", "Verify Objective description is They will answer a likert interaction");

		objective = SB.getObjective('8_1');
		strictEqual(objective.id, "8_1", "Verify Objective id is 8_1");
		strictEqual(objective.score.scaled, "0", "Verify Objective score.scaled is '0'");
		strictEqual(objective.score.raw, "0", "Verify Objective score raw is '0'");
		strictEqual(objective.score.min, "0", "Verify Objective score min is '0'");
		strictEqual(objective.score.max, "1", "Verify Objective score max is '1'");
		strictEqual(objective.success_status, "unknown", "Verify Objective success_status is 'unknown'");
		strictEqual(objective.completion_status, "not attempted", "Verify Objective completion_status is 'not attempted'");
		strictEqual(objective.progress_measure, "0", "Verify Objective progress_measure is '0'");
		strictEqual(objective.description, "They will answer a other interaction", "Verify Objective description is They will answer a other interaction");

		objective = SB.getObjective('9_1');
		strictEqual(objective.id, "9_1", "Verify Objective id is 9_1");
		strictEqual(objective.score.scaled, "0", "Verify Objective score.scaled is '0'");
		strictEqual(objective.score.raw, "0", "Verify Objective score raw is '0'");
		strictEqual(objective.score.min, "0", "Verify Objective score min is '0'");
		strictEqual(objective.score.max, "1", "Verify Objective score max is '1'");
		strictEqual(objective.success_status, "unknown", "Verify Objective success_status is 'unknown'");
		strictEqual(objective.completion_status, "not attempted", "Verify Objective completion_status is 'not attempted'");
		strictEqual(objective.progress_measure, "0", "Verify Objective progress_measure is '0'");
		strictEqual(objective.description, "They will answer a performance interaction", "Verify Objective description is They will answer a performance interaction");

		objective = SB.getObjective('10_1');
		strictEqual(objective.id, "10_1", "Verify Objective id is 10_1");
		strictEqual(objective.score.scaled, "0", "Verify Objective score.scaled is '0'");
		strictEqual(objective.score.raw, "0", "Verify Objective score raw is '0'");
		strictEqual(objective.score.min, "0", "Verify Objective score min is '0'");
		strictEqual(objective.score.max, "1", "Verify Objective score max is '1'");
		strictEqual(objective.success_status, "unknown", "Verify Objective success_status is 'unknown'");
		strictEqual(objective.completion_status, "not attempted", "Verify Objective completion_status is 'not attempted'");
		strictEqual(objective.progress_measure, "0", "Verify Objective progress_measure is '0'");
		strictEqual(objective.description, "They will answer a numeric interaction", "Verify Objective description is They will answer a numeric interaction");

		strictEqual(SB.getInteraction('999_9'), 'false', "Getting bogus objective, should be false");
		SB.debug(">>>>>>>>> End Verify Objective(s) <<<<<<<<<");
	} else {
		// Some scores were set, verify they are still there (LMS Only)
		SB.debug(">>>>>>>>> Verify Objective(s) <<<<<<<<<");
		strictEqual(SB.getvalue('cmi.objectives._count'), '10', "Getting objective._count, should be '10'");
		objective = SB.getObjective('1_1');
		strictEqual(objective.id, "1_1", "Verify Objective id is 1_1");
		strictEqual(objective.score.scaled, "1", "Verify Objective score.scaled is 1");
		strictEqual(objective.score.raw, "1.5", "Verify Objective score raw is 1.5");
		strictEqual(objective.score.min, "0", "Verify Objective score min is 0");
		strictEqual(objective.score.max, "1.5", "Verify Objective score max is 1.5");
		strictEqual(objective.success_status, "passed", "Verify Objective success_status is passed");
		strictEqual(objective.completion_status, "completed", "Verify Objective completion_status is completed");
		strictEqual(objective.progress_measure, "1", "Verify Objective progress_measure is 1");
		strictEqual(objective.description, "They will answer a true false interaction", "Verify Objective description is They will answer a true false interaction");

		objective = SB.getObjective('2_1');
		strictEqual(objective.id, "2_1", "Verify Objective id is 2_1");
		strictEqual(objective.score.scaled, "1", "Verify Objective score.scaled is 1");
		strictEqual(objective.score.raw, "2", "Verify Objective score raw is 2");
		strictEqual(objective.score.min, "0", "Verify Objective score min is 0");
		strictEqual(objective.score.max, "2", "Verify Objective score max is 2");
		strictEqual(objective.success_status, "passed", "Verify Objective success_status is 'passed'");
		strictEqual(objective.completion_status, "completed", "Verify Objective completion_status is 'completed'");
		strictEqual(objective.progress_measure, "1", "Verify Objective progress_measure is '1'");
		strictEqual(objective.description, "They will answer a multiple choice interaction", "Verify Objective description is They will answer a multiple choice interaction");

		objective = SB.getObjective('3_1');
		strictEqual(objective.id, "3_1", "Verify Objective id is 3_1");
		strictEqual(objective.score.scaled, "1", "Verify Objective score.scaled is '1'");
		strictEqual(objective.score.raw, "5.25", "Verify Objective score raw is '5.25'");
		strictEqual(objective.score.min, "0", "Verify Objective score min is 0");
		strictEqual(objective.score.max, "5.25", "Verify Objective score max is '5.25'");
		strictEqual(objective.success_status, "passed", "Verify Objective success_status is 'passed'");
		strictEqual(objective.completion_status, "completed", "Verify Objective completion_status is 'completed'");
		strictEqual(objective.progress_measure, "1", "Verify Objective progress_measure is '1'");
		strictEqual(objective.description, "They will answer a fill in interaction", "Verify Objective description is They will answer a fill in interaction");

		objective = SB.getObjective('4_1');
		strictEqual(objective.id, "4_1", "Verify Objective id is 4_1");
		strictEqual(objective.score.scaled, "1", "Verify Objective score.scaled is '0'");
		strictEqual(objective.score.raw, "1.333", "Verify Objective score raw is '1.333'");
		strictEqual(objective.score.min, "0", "Verify Objective score min is '0'");
		strictEqual(objective.score.max, "1.333", "Verify Objective score max is '1.333'");
		strictEqual(objective.success_status, "passed", "Verify Objective success_status is 'passed'");
		strictEqual(objective.completion_status, "completed", "Verify Objective completion_status is 'completed'");
		strictEqual(objective.progress_measure, "1", "Verify Objective progress_measure is '1'");
		strictEqual(objective.description, "They will answer a sequencing interaction", "Verify Objective description is They will answer a sequencing interaction");

		objective = SB.getObjective('5_1');
		strictEqual(objective.id, "5_1", "Verify Objective id is 5_1");
		strictEqual(objective.score.scaled, "1", "Verify Objective score.scaled is '1'");
		strictEqual(objective.score.raw, "1", "Verify Objective score raw is '1'");
		strictEqual(objective.score.min, "0", "Verify Objective score min is '0'");
		strictEqual(objective.score.max, "1", "Verify Objective score max is '1'");
		strictEqual(objective.success_status, "passed", "Verify Objective success_status is 'passed'");
		strictEqual(objective.completion_status, "completed", "Verify Objective completion_status is 'completed'");
		strictEqual(objective.progress_measure, "1", "Verify Objective progress_measure is '1'");
		strictEqual(objective.description, "They will answer a long fill in interaction", "Verify Objective description is They will answer a long fill in interaction");

		objective = SB.getObjective('6_1');
		strictEqual(objective.id, "6_1", "Verify Objective id is 6_1");
		strictEqual(objective.score.scaled, "1", "Verify Objective score.scaled is '1'");
		strictEqual(objective.score.raw, "1", "Verify Objective score raw is '1'");
		strictEqual(objective.score.min, "0", "Verify Objective score min is 0");
		strictEqual(objective.score.max, "1", "Verify Objective score max is 1");
		strictEqual(objective.success_status, "passed", "Verify Objective success_status is 'passed'");
		strictEqual(objective.completion_status, "completed", "Verify Objective completion_status is 'completed'");
		strictEqual(objective.progress_measure, "1", "Verify Objective progress_measure is '1'");
		strictEqual(objective.description, "They will answer a matching interaction", "Verify Objective description is They will answer a matching interaction");

		objective = SB.getObjective('7_1');
		strictEqual(objective.id, "7_1", "Verify Objective id is 7_1");
		strictEqual(objective.score.scaled, "0", "Verify Objective score.scaled is 0");
		strictEqual(objective.score.raw, "0", "Verify Objective score raw is 0");
		strictEqual(objective.score.min, "0", "Verify Objective score min is 0");
		strictEqual(objective.score.max, "1", "Verify Objective score max is 1");
		strictEqual(objective.success_status, "unknown", "Verify Objective success_status is unknown");
		strictEqual(objective.completion_status, "not attempted", "Verify Objective completion_status is not attempted");
		strictEqual(objective.progress_measure, "0", "Verify Objective progress_measure is 0");
		strictEqual(objective.description, "They will answer a likert interaction", "Verify Objective description is They will answer a likert interaction");

		objective = SB.getObjective('8_1');
		strictEqual(objective.id, "8_1", "Verify Objective id is 8_1");
		strictEqual(objective.score.scaled, "0", "Verify Objective score.scaled is 0");
		strictEqual(objective.score.raw, "0", "Verify Objective score raw is 0");
		strictEqual(objective.score.min, "0", "Verify Objective score min is 0");
		strictEqual(objective.score.max, "1", "Verify Objective score max is 1");
		strictEqual(objective.success_status, "unknown", "Verify Objective success_status is unknown");
		strictEqual(objective.completion_status, "not attempted", "Verify Objective completion_status is not attempted");
		strictEqual(objective.progress_measure, "0", "Verify Objective progress_measure is 0");
		strictEqual(objective.description, "They will answer a other interaction", "Verify Objective description is They will answer a other interaction");

		objective = SB.getObjective('9_1');
		strictEqual(objective.id, "9_1", "Verify Objective id is 9_1");
		strictEqual(objective.score.scaled, "0", "Verify Objective score.scaled is 0");
		strictEqual(objective.score.raw, "0", "Verify Objective score raw is 0");
		strictEqual(objective.score.min, "0", "Verify Objective score min is 0");
		strictEqual(objective.score.max, "1", "Verify Objective score max is 1");
		strictEqual(objective.success_status, "unknown", "Verify Objective success_status is unknown");
		strictEqual(objective.completion_status, "not attempted", "Verify Objective completion_status is not attempted");
		strictEqual(objective.progress_measure, "0", "Verify Objective progress_measure is 0");
		strictEqual(objective.description, "They will answer a performance interaction", "Verify Objective description is They will answer a performance interaction");

		objective = SB.getObjective('10_1');
		strictEqual(objective.id, "10_1", "Verify Objective id is 10_1");
		strictEqual(objective.score.scaled, "0", "Verify Objective score.scaled is 0");
		strictEqual(objective.score.raw, "0", "Verify Objective score raw is 0");
		strictEqual(objective.score.min, "0", "Verify Objective score min is 0");
		strictEqual(objective.score.max, "1", "Verify Objective score max is 1");
		strictEqual(objective.success_status, "unknown", "Verify Objective success_status is unknown");
		strictEqual(objective.completion_status, "not attempted", "Verify Objective completion_status is not attempted");
		strictEqual(objective.progress_measure, "0", "Verify Objective progress_measure is 0");
		strictEqual(objective.description, "They will answer a numeric interaction", "Verify Objective description is They will answer a numeric interaction");

		strictEqual(SB.getInteraction('999_9'), 'false', "Getting bogus objective, should be false");
		SB.debug(">>>>>>>>> End Verify Objective(s) <<<<<<<<<");
	}
});

test("Interactions", function () {
	var startTime = new Date(),
		endTime = new Date(startTime),
		intID = '1',
		objID = '1_1',
		n = '', // for interaction.n Array value (locator)
		m = '', // for Interaction.n.objective.m array value (locator)
		type = ''; // Interaction Type for 3rd or 4th edition
	endTime.setMinutes(startTime.getMinutes() + 5); // Add 5 minutes for latency, result would be PT5M

	if (SB.getEntry() !== 'resume') {
		strictEqual(SB.getvalue('cmi.interactions._count'), '0', "Getting interactions._count, should be '0'");
		SB.debug(">>>>>>>>> Setting Interaction(s) <<<<<<<<<");
		// True False Interaction
		strictEqual(SB.setInteraction({
			id:                intID, // {String}
			type:              'true-false', // {String}
			objectives:        [
				// {Array}
				{                      // {Object}
					id: objID          // {String}
				}
			],
			timestamp:         startTime, // {Object} date start
			correct_responses: [
				// {Array}
				{                      // {Object}
					pattern: 'true'    // {String} true or false
				}
			],
			weighting:         '1', // {String}
			learner_response:  'true', // {String} true or false
			result:            'correct', // {String} correct, incorrect, neutral
			latency:           endTime, // {Object} date end
			description:       'This is the question?' // {String} question commonly
		}), 'true', "Setting true/false Interaction 1");

		// Verify Data was set properly, I'm using long-hand scorm calls for this
		n = scorm.getInteractionByID(intID);
		m = scorm.getInteractionObjectiveByID(n, objID);
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.type'), 'true-false', 'Verifying cmi.interactions.' + n + '.type is true-false');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.objectives._count'), '1', 'Verifying cmi.interactions.' + n + '.objectives._count count is 1');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.objectives.' + m + '.id'), '1_1', 'Verifying cmi.interactions.' + n + '.objectives.' + m + '.id id is 1_1');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.learner_response'), 'true', 'Verifying cmi.interactions.' + n + '.learner_response is true');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.result'), 'correct', 'Verifying cmi.interactions.' + n + '.result is correct');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.latency'), 'PT5M', 'Verifying cmi.interactions.' + n + '.latency is PT5M');
		// End True False Interaction

		// Multiple Choice Interaction
		intID = '2';
		objID = '2_1';
		//endTime.setMinutes(startTime.getMinutes() + 10); // Add 5 minutes for latency, result would be PT10M
		strictEqual(SB.setInteraction({
			id:                intID, // {String}
			type:              'choice', // {String}
			objectives:        [
				// {Array}
				{                     // {Object}
					id: objID         // {String}
				}
			],
			timestamp:         startTime, // {Object} date start
			correct_responses: [
				// {Array}
				{                     // {Object}
					pattern: ["a", "b"] // {Array}
				}
			],
			weighting:         '1', // {String}
			learner_response:  ["a", "c"], // {Array}
			result:            'incorrect', // {String} correct, incorrect, neutral
			latency:           endTime, // {Object} date end
			description:       'Which choices would <b>you</b> pick?' // {String} question commonly
		}), 'true', "Setting multiple choice Interaction 2");

		// Verify Data was set properly, I'm using long-hand scorm calls for this
		n = scorm.getInteractionByID(intID);
		m = scorm.getInteractionObjectiveByID(n, objID);
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.type'), "choice", 'Verifying cmi.interactions.' + n + '.type is choice');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.objectives._count'), '1', 'Verifying cmi.interactions.' + n + '.objectives._count count is 1');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.objectives.' + m + '.id'), '2_1', 'Verifying cmi.interactions.' + n + '.objectives.' + m + '.id id is 2_1');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.learner_response'), 'a[,]c', 'Verifying cmi.interactions.' + n + '.learner_response is a[,]c');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.result'), 'incorrect', 'Verifying cmi.interactions.' + n + '.result is incorrect');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.latency'), 'PT5M', 'Verifying cmi.interactions.' + n + '.latency is PT5M');
		// End Multiple Choice Interaction

		// Fill In Interaction
		intID = '3';
		objID = '3_1';
		//endTime.setMinutes(startTime.getMinutes() + 11); // Add 5 minutes for latency, result would be PT10M
		strictEqual(SB.setInteraction({
			id:                intID, // {String}
			type:              'fill-in', // {String}
			objectives:        [
				// {Array}
				{                  // {Object}
					id: objID      // {String}
				}
			],
			timestamp:         startTime, // {Object} date start
			correct_responses: [
				// {Array}
				{                  // {Object}
					pattern: {     // {Object}
						case_matters:  true, // {Boolean}
						order_matters: true, // {Boolean}
						lang:          'en', // {String} 2 or 3 letter lang code
						words:         ["car", "automobile"] // {Array} of {String}s
					}
				}
			],
			weighting:         '1', // {String}
			learner_response:  {    // {Object}
				lang:  'en', // {String} 2 or 3 letter lang code
				words: ["car", "automobile"] // {Array} of {String}s
			},
			result:            'correct', // {String} correct, incorrect, neutral
			latency:           endTime, // {Object} date end
			description:       'Which choices would <b>you</b> pick?' // {String} question commonly
		}), 'true', "Setting Fill In Interaction 3");

		// Verify Data was set properly, I'm using long-hand scorm calls for this
		n = scorm.getInteractionByID(intID);
		m = scorm.getInteractionObjectiveByID(n, objID);
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.type'), 'fill-in', 'Verifying cmi.interactions.' + n + '.type is fill-in');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.objectives._count'), '1', 'Verifying cmi.interactions.' + n + '.objectives._count count is 1');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.objectives.' + m + '.id'), '3_1', 'Verifying cmi.interactions.' + n + '.objectives.' + m + '.id id is 3_1');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.learner_response'), '{lang=en}car[,]automobile', 'Verifying cmi.interactions.' + n + '.learner_response is {lang=en}car[,]automobile');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.result'), 'correct', 'Verifying cmi.interactions.' + n + '.result is correct');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.latency'), 'PT5M', 'Verifying cmi.interactions.' + n + '.latency is PT5M');
		// End Fill In Interaction

		// Sequencing Interaction
		intID = '4';
		objID = '4_1';
		//endTime.setMinutes(startTime.getMinutes() + 15); // Add 5 minutes for latency, result would be PT10M
		strictEqual(SB.setInteraction({
			id:                intID, // {String}
			type:              'sequencing', // {String}
			objectives:        [
				// {Array}
				{                  // {Object}
					id: objID      // {String}
				}
			],
			timestamp:         startTime, // {Object} date start
			correct_responses: [
				// {Array}
				{                  // {Object}
					pattern: ["c", "b", "a"]  // {Array}
				}
			],
			weighting:         '1', // {String}
			learner_response:  ["a", "c", "b"], // {Array}
			result:            'incorrect', // {String} correct, incorrect, neutral
			latency:           endTime, // {Object} date end (optional)
			description:       'Place these options in order' // {String}
		}), 'true', "Setting sequencing Interaction 4");

		// Verify Data was set properly, I'm using long-hand scorm calls for this
		n = scorm.getInteractionByID(intID);
		m = scorm.getInteractionObjectiveByID(n, objID);
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.type'), 'sequencing', 'Verifying cmi.interactions.' + n + '.type is sequencing');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.objectives._count'), '1', 'Verifying cmi.interactions.' + n + '.objectives._count count is 1');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.objectives.' + m + '.id'), '4_1', 'Verifying cmi.interactions.' + n + '.objectives.' + m + '.id id is 4_1');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.learner_response'), 'a[,]c[,]b', 'Verifying cmi.interactions.' + n + '.learner_response is a[,]c[,]b');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.result'), 'incorrect', 'Verifying cmi.interactions.' + n + '.result is incorrect');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.latency'), 'PT5M', 'Verifying cmi.interactions.' + n + '.latency is PT5M');
		// End Sequencing Interaction

		// Long Fill In Interaction
		intID = '5';
		objID = '5_1';
		//endTime.setMinutes(startTime.getMinutes() + 21); // Add 5 minutes for latency, result would be PT10M
		strictEqual(SB.setInteraction({
			id:                intID, // {String}
			type:              'long-fill-in', // {String}
			objectives:        [
				// {Array}
				{                                    // {Object}
					id: objID                        // {String}
				}
			],
			timestamp:         startTime, // {Object} date start
			correct_responses: [
				// {Array}
				{                                    // {Object}
					pattern: {                       // {Object}
						lang:         'en', // {String} lang code (optional)
						case_matters: false, // {Boolean} (optional)
						text:         "it's been a long day" // {String}
					}
				}
			],
			weighting:         '1', // {String}
			learner_response:  {                      // {Object}
				lang: 'en', // {String} lang code (optional)
				text: "There was one once, but it's been a long day." // {String}
			},
			result:            'correct', // {String} correct, incorrect, neutral
			latency:           endTime, // {Object} date end (optional)
			description:       'Which choices would <b>you</b> pick?' // {String}
		}), 'true', "Setting long fill in Interaction 5");

		// Verify Data was set properly, I'm using long-hand scorm calls for this
		n = scorm.getInteractionByID(intID);
		m = scorm.getInteractionObjectiveByID(n, objID);
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.type'), 'long-fill-in', 'Verifying cmi.interactions.' + n + '.type is long-fill-in');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.objectives._count'), '1', 'Verifying cmi.interactions.' + n + '.objectives._count count is 1');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.objectives.' + m + '.id'), '5_1', 'Verifying cmi.interactions.' + n + '.objectives.' + m + '.id id is 5_1');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.learner_response'), "{lang=en}There was one once, but it's been a long day.", "Verifying cmi.interactions." + n + ".learner_response is {lang=en}There was one once, but it's been a long day.");
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.result'), 'correct', 'Verifying cmi.interactions.' + n + '.result is correct');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.latency'), 'PT5M', 'Verifying cmi.interactions.' + n + '.latency is PT5M');
		// End Long Fill In Choice Interaction

		// Matching Interaction
		intID = '6';
		objID = '6_1';
		//endTime.setMinutes(startTime.getMinutes() + 15); // Add 5 minutes for latency, result would be PT10M
		strictEqual(SB.setInteraction({
			id:                intID, // {String}
			type:              'matching', // {String}
			objectives:        [
				// {Array}
				{                                  // {Object}
					id: objID                      // {String}
				}
			],
			timestamp:         startTime, // {Object} date start
			correct_responses: [
				// {Array}
				{                                  // {Object}
					pattern: [
						// {Array}
						["tile_1", "target_2"],
						// {Array} of {String}s
						["tile_2", "target_1"],
						["tile_3", "target_3"]
					]
				}
			],
			weighting:         '1', // {String}
			learner_response:  [
				// {Array}
				["tile_1", "target_2"],
				// {Array} of {String}s
				["tile_2", "target_1"],
				["tile_3", "target_3"]
			],
			result:            'correct', // {String} correct, incorrect, neutral
			latency:           endTime, // {Object} date end (optional)
			description:       "Place these steps over the matching order you'd do them." // {String} question commonly
		}), 'true', "Setting matching Interaction 6");

		// Verify Data was set properly, I'm using long-hand scorm calls for this
		n = scorm.getInteractionByID(intID);
		m = scorm.getInteractionObjectiveByID(n, objID);
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.type'), 'matching', 'Verifying cmi.interactions.' + n + '.type is matching');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.objectives._count'), '1', 'Verifying cmi.interactions.' + n + '.objectives._count count is 1');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.objectives.' + m + '.id'), '6_1', 'Verifying cmi.interactions.' + n + '.objectives.' + m + '.id id is 6_1');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.learner_response'), 'tile_1[.]target_2[,]tile_2[.]target_1[,]tile_3[.]target_3', 'Verifying cmi.interactions.' + n + '.learner_response is tile_1[.]target_2[,]tile_2[.]target_1[,]tile_3[.]target_3');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.result'), 'correct', 'Verifying cmi.interactions.' + n + '.result is correct');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.latency'), 'PT5M', 'Verifying cmi.interactions.' + n + '.latency is PT5M');
		// End Matching Interaction

		// LikeRT Interaction
		intID = '7';
		objID = '7_1';
		//endTime.setMinutes(startTime.getMinutes() + 15); // Add 5 minutes for latency, result would be PT10M
		strictEqual(SB.setInteraction({
			id:                intID, // {String}
			type:              'likert', // {String}
			objectives:        [
				// {Array}
				{                                            // {Object}
					id: objID                                // {String}
				}
			],
			timestamp:         startTime, // {Object} date start
			correct_responses: [
				{                                            // {Object}
					pattern: "strongly_agree"                // {String}
				}/*
				Apparently likert only allows for one response pattern...fun
				,
				{                                            // {Object}
					pattern: "agree"                         // {String}
				},
				{                                            // {Object}
					pattern: "disagree"                      // {String}
				},
				{                                            // {Object}
					pattern: "strongly_disagree"             // {String}
				}*/
			],
			weighting:         '1', // {String}
			learner_response:  "strongly_agree", // {String} commonly a unique identifier for the group
			result:            'correct', // {String} correct, incorrect, neutral
			latency:           endTime, // {Object} date end (optional)
			description:       "Do you like filling in surveys?"   // {String} question commonly
		}), 'true', "Setting likert Interaction 7");

		// Verify Data was set properly, I'm using long-hand scorm calls for this
		n = scorm.getInteractionByID(intID);
		m = scorm.getInteractionObjectiveByID(n, objID);
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.type'), 'likert', 'Verifying cmi.interactions.' + n + '.type is likert');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.objectives._count'), '1', 'Verifying cmi.interactions.' + n + '.objectives._count count is 1');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.objectives.' + m + '.id'), '7_1', 'Verifying cmi.interactions.' + n + '.objectives.' + m + '.id id is 7_1');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.learner_response'), 'strongly_agree', 'Verifying cmi.interactions.' + n + '.learner_response is strongly_agree');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.result'), 'correct', 'Verifying cmi.interactions.' + n + '.result is correct');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.latency'), 'PT5M', 'Verifying cmi.interactions.' + n + '.latency is PT5M');
		// End LikeRT Interaction

		// Other Interaction
		intID = '8';
		objID = '8_1';
		//endTime.setMinutes(startTime.getMinutes() + 15); // Add 5 minutes for latency, result would be PT10M
		strictEqual(SB.setInteraction({
			id:                intID, // {String}
			type:              'other', // {String}
			objectives:        [
				// {Array}
				{                                                            // {Object}
					id: objID                                                // {String}
				}
			],
			timestamp:         startTime, // {Object} date start
			correct_responses: [
				{                                                            // {Object}
					pattern: "Anything we want."                             // {String}
				}/*
				Apparently you can't have more than one pattern in 'other'.  Very odd... whats the point?!?!
				,
				{
					pattern: "Almost anything."                              // {String}
				},
				{
					pattern: "Everything."                                   // {String}
				},
				{
					pattern: "A ton of stuff!"                               // {String}
				}*/
			],
			weighting:         '1', // {String}
			learner_response:  "Anything we want.", // {String}
			result:            'correct', // {String} correct, incorrect, neutral
			latency:           endTime, // {Object} date end (optional)
			description:       "What can we put in the 'other' interaction type?"  // {String} question commonly
		}), 'true', "Setting other Interaction 8");

		// Verify Data was set properly, I'm using long-hand scorm calls for this
		n = scorm.getInteractionByID(intID);
		m = scorm.getInteractionObjectiveByID(n, objID);
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.type'), 'other', 'Verifying cmi.interactions.' + n + '.type is other');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.objectives._count'), '1', 'Verifying cmi.interactions.' + n + '.objectives._count count is 1');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.objectives.' + m + '.id'), '8_1', 'Verifying cmi.interactions.' + n + '.objectives.' + m + '.id id is 8_1');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.learner_response'), 'Anything we want.', 'Verifying cmi.interactions.' + n + '.learner_response is Anything we want.');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.result'), 'correct', 'Verifying cmi.interactions.' + n + '.result is correct');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.latency'), 'PT5M', 'Verifying cmi.interactions.' + n + '.latency is PT5M');
		// End Other Interaction

		// Performance Interaction
		intID = '9';
		objID = '9_1';
		//endTime.setMinutes(startTime.getMinutes() + 15); // Add 5 minutes for latency, result would be PT10M
		strictEqual(SB.setInteraction({
			id:                intID, // {String}
			type:              'performance', // {String}
			objectives:        [
				// {Array}
				{                                                         // {Object}
					id: objID                                             // {String}
				}
			],
			timestamp:         startTime, // {Object} date start
			correct_responses: [
				// {Array}
				{                                                         // {Object}
					pattern: {                                            // {Object}
						order_matters: false, // {Boolean} (optional)
						answers:       [
							// {Array}
							["step_1", {min: 5, max: 6}],
							// {Array} of {String}s step identifier (optional)
							["step_2", "answer_1"],
							["step_3", "answer_3"]
						]
					}
				}
			],
			weighting:         '1', // {String}
			learner_response:  [
				// {Array}
				["step_1", "5.24"],
				// {Array} of {String}s step identifier (optional)
				["step_2", "answer_1"],
				["step_3", "answer_3"]
			],
			result:            'correct', // {String} correct, incorrect, neutral
			latency:           endTime, // {Object} date end (optional)
			description:       "Arrange the pairs into an order of completion." // {String} question commonly
		}), 'true', "Setting matching Interaction 9");

		// Verify Data was set properly, I'm using long-hand scorm calls for this
		n = scorm.getInteractionByID(intID);
		m = scorm.getInteractionObjectiveByID(n, objID);
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.type'), 'performance', 'Verifying cmi.interactions.' + n + '.type is performance');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.objectives._count'), '1', 'Verifying cmi.interactions.' + n + '.objectives._count count is 1');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.objectives.' + m + '.id'), '9_1', 'Verifying cmi.interactions.' + n + '.objectives.' + m + '.id id is 9_1');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.correct_responses.0.pattern'), '{order_matters=false}step_1[.]5[:]6[,]step_2[.]answer_1[,]step_3[.]answer_3', 'Verifying cmi.interactions.' + n + '.correct_response.pattern.0 is {order_matters=false}step_1[.]5[:]6[,]step_2[.]answer_1[,]step_3[.]answer_3');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.learner_response'), 'step_1[.]5.24[,]step_2[.]answer_1[,]step_3[.]answer_3', 'Verifying cmi.interactions.' + n + '.learner_response is step_1[.]step_answer_2[,]step_2[.]answer_1[,]step_3[.]answer_3');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.result'), 'correct', 'Verifying cmi.interactions.' + n + '.result is correct');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.latency'), 'PT5M', 'Verifying cmi.interactions.' + n + '.latency is PT5M');
		// End Performance Interaction

		// Numeric Interaction
		intID = '10';
		objID = '10_1';
		//endTime.setMinutes(startTime.getMinutes() + 15); // Add 5 minutes for latency, result would be PT10M
		strictEqual(SB.setInteraction({
			id:                intID, // {String}
			type:              'numeric', // {String}
			objectives:        [
				// {Array}
				{                                                         // {Object}
					id: objID                                             // {String}
				}
			],
			timestamp:         startTime, // {Object} date start
			correct_responses: [
				// {Array}
				{                                                         // {Object}
					pattern: {                                            // {Object}
						min: 9.123456789,
						max: 11
					}
				}
			],
			weighting:         '1', // {String}
			learner_response:  "10.5", // {String}
			result:            'correct', // {String} correct, incorrect, neutral
			latency:           endTime, // {Object} date end (optional)
			description:       "Just fill in some random decimal that looks like 10.5." // {String} question commonly
		}), 'true', "Setting numeric Interaction 10");
		//SB.debug("I AM CHECKIN A SMALL SUBSET WITH A NEW LATENCY +++++++++++++++++++++++++++++++++", 4);
		/*strictEqual(SB.setInteraction({
		 id: intID,                                                    // {String}
		 latency: endTime,                                             // {Object} date end (optional)
		 description: "Just fill in some random decimal that looks like 10.5." // {String} question commonly
		 }), 'true', "Setting numeric Interaction 6");*/

		// Verify Data was set properly, I'm using long-hand scorm calls for this
		n = scorm.getInteractionByID(intID);
		m = scorm.getInteractionObjectiveByID(n, objID);
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.type'), 'numeric', 'Verifying cmi.interactions.' + n + '.type is numeric');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.objectives._count'), '1', 'Verifying cmi.interactions.' + n + '.objectives._count count is 1');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.objectives.' + m + '.id'), '10_1', 'Verifying cmi.interactions.' + n + '.objectives.' + m + '.id id is 9_1');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.learner_response'), '10.5', 'Verifying cmi.interactions.' + n + '.learner_response is 10.5');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.result'), 'correct', 'Verifying cmi.interactions.' + n + '.result is correct');
		strictEqual(SB.getvalue('cmi.interactions.' + n + '.latency'), 'PT5M', 'Verifying cmi.interactions.' + n + '.latency is PT5M');
		// End Performance Interaction
		strictEqual(SB.getvalue('cmi.interactions._count'), '10', "Getting interactions._count, should be '10'");
		SB.debug(">>>>>>>>> End Setting Interaction(s) <<<<<<<<<");
	}
	SB.debug('>>>>>> Verify Interaction Block <<<<<<<');
	var interaction = SB.getInteraction('1'); // True False
	SB.debug(interaction);
	strictEqual(interaction.id, '1', 'Verify Interaction ID 1');
	strictEqual(interaction.type, 'true-false', 'Verify Interaction Type true-false');
	strictEqual(interaction.objectives[0].id, '1_1', 'Verify Interaction Objectives 1_1');
	strictEqual(interaction.correct_responses[0].pattern, 'true', 'Verify Interaction Correct Responses true');
	strictEqual(interaction.weighting, '1', 'Verify Interaction weighting 1');
	strictEqual(interaction.learner_response, 'true', 'Verify Interaction learner response true');
	strictEqual(interaction.result, 'correct', 'Verify Interaction result correct');
	strictEqual(interaction.description, 'This is the question?', 'Verify Interaction description "This is the question?"');

	interaction = SB.getInteraction('2'); // Choice
	SB.debug(interaction);
	strictEqual(interaction.id, '2', 'Verify Interaction ID 2');
	strictEqual(interaction.type, 'choice', 'Verify Interaction Type choice');
	strictEqual(interaction.objectives[0].id, '2_1', 'Verify Interaction Objectives 2_1');
	SB.debug("Response pattern");
	SB.debug(interaction.correct_responses[0].pattern);
	deepEqual(interaction.correct_responses[0].pattern, ["a", "b"], 'Verify Interaction Correct Responses [a,b]');
	strictEqual(interaction.weighting, '1', 'Verify Interaction weighting 1');
	deepEqual(interaction.learner_response, ["a", "c"], 'Verify Interaction learner response [a,c]');
	strictEqual(interaction.result, 'incorrect', 'Verify Interaction result incorrect');
	strictEqual(interaction.description, 'Which choices would <b>you</b> pick?', 'Verify Interaction description "Which choices would <b>you</b> pick?"');

	// TODO Write rest of tests...

	SB.debug('>>>>>>>>> End Interaction Verification <<<<<<<<<<');
});

/*test("Get Interaction By ID", function() {
 // Verify Interaction 1


 // End
 // Verify Interaction 2
 interaction = SB.getInteraction('2'); // Multiple Choice

 interaction = SB.getInteraction('3'); // Fill In

 interaction = SB.getInteraction('4'); // Sequencing

 interaction = SB.getInteraction('5'); // Long Fill In

 interaction = SB.getInteraction('6'); // Matching

 interaction = SB.getInteraction('7'); // LikeRT

 interaction = SB.getInteraction('8'); // Other

 strictEqual(SB.getInteraction('999'), 'false', "Getting bogus interaction, should be false");

 });*/

test("Update Objective By ID", function () {

	if (SB.getEntry() !== "resume") {
		SB.debug(">>>>>>>>> Updating Objective(s) <<<<<<<<<");
		// For True False
		strictEqual(SB.setObjective({
			id:                '1_1', // {String}
			score:             {                                                     // {Object}
				scaled: '1', // {String}
				raw:    '1.5'                                               // {String}
			},
			success_status:    'passed', // {String} passed, failed, unknown
			completion_status: 'completed', // {String} completed, incomplete, not attempted
			progress_measure:  '1'                                        // {String}
		}), 'true', "Setting Objective True False 1_1 unscored");
		// For True False
		strictEqual(SB.setObjective({
			id:                '2_1', // {String}
			score:             {                                                     // {Object}
				scaled: '1', // {String}
				raw:    '2'                                                 // {String}
			},
			success_status:    'passed', // {String} passed, failed, unknown
			completion_status: 'completed', // {String} completed, incomplete, not attempted
			progress_measure:  '1'                                        // {String}
		}), 'true', "Setting Objective True False 1_1 unscored");
		// For True False
		strictEqual(SB.setObjective({
			id:                '3_1', // {String}
			score:             {                                                     // {Object}
				scaled: '1', // {String}
				raw:    '5.25'                                              // {String}
			},
			success_status:    'passed', // {String} passed, failed, unknown
			completion_status: 'completed', // {String} completed, incomplete, not attempted
			progress_measure:  '1'                                        // {String}
		}), 'true', "Setting Objective True False 1_1 unscored");
		// For True False
		strictEqual(SB.setObjective({
			id:                '4_1', // {String}
			score:             {                                                     // {Object}
				scaled: '1', // {String}
				raw:    '1.333'                                             // {String}
			},
			success_status:    'passed', // {String} passed, failed, unknown
			completion_status: 'completed', // {String} completed, incomplete, not attempted
			progress_measure:  '1'                                       // {String}
		}), 'true', "Setting Objective True False 1_1 unscored");
		// For True False
		strictEqual(SB.setObjective({
			id:                '5_1', // {String}
			score:             {                                                     // {Object}
				scaled: '1', // {String}
				raw:    '1'                                             // {String}
			},
			success_status:    'passed', // {String} passed, failed, unknown
			completion_status: 'completed', // {String} completed, incomplete, not attempted
			progress_measure:  '1'                                       // {String}
		}), 'true', "Setting Objective True False 1_1 unscored");
		// For True False
		strictEqual(SB.setObjective({
			id:                '6_1', // {String}
			score:             {                                                     // {Object}
				scaled: '1', // {String}
				raw:    '1'                                             // {String}
			},
			success_status:    'passed', // {String} passed, failed, unknown
			completion_status: 'completed', // {String} completed, incomplete, not attempted
			progress_measure:  '1'                                       // {String}
		}), 'true', "Setting Objective True False 1_1 unscored");
		SB.debug(">>>>>>>>> End Updating Objective(s) <<<<<<<<<");
	} else {
		// Do something else?  With no tests this will cause a assertion error in QUnit.
		// Doing any updating to these objectives means needing to manage resumes and verifying.
		// This is a little too complicated now to test for how many times this was attempted.
		strictEqual(SB.getvalue('cmi.objectives._count'), '10', "Getting objectives._count, should be '10'");
	}

});

test("Set Suspend Data By Page ID", function () {
	var result,
		answer_arr = ["a", "b", "c", "d"],
		images_arr = ["bird.png", "bug.png", "helicopter.png"];
	// Save Suspend Data for Page 1
	strictEqual(SB.setSuspendDataByPageID(1, 'Sample Data 1', {
		answers:    answer_arr,
		characters: character_str,
		question:   "This <b>is</b> the question?",
		numtries:   2
	}), 'true', 'Setting some sample suspend data for page 1');
	// Verify saved Suspend Data for Page 1
	result = SB.getSuspendDataByPageID(1);
	strictEqual(result.answers, answer_arr, "Verify answers: ['a','b','c','d']");
	strictEqual(result.characters, character_str, "Verify Character String");
	strictEqual(result.question, 'This <b>is</b> the question?', 'Verify question: This <b>is</b> the question?');
	strictEqual(result.numtries, 2, 'Verify numtries: 2');
	// End Test 1
	// Save Suspend Data for Page 2
	strictEqual(SB.setSuspendDataByPageID(2, 'Sample Data 2', {
		short_answer: "This is a short answer with text they typed in.",
		characters:   character_str,
		question:     "How did you feel about the question?",
		images:       images_arr
	}), 'true', 'Setting some sample suspend data for page 2');
	// Verify saved Suspend Data for Page 4
	result = SB.getSuspendDataByPageID(2);
	strictEqual(result.short_answer, 'This is a short answer with text they typed in.', 'Verify short_answer: This is a short answer with text they typed in.');
	strictEqual(result.characters, character_str, "Verify Character String");
	strictEqual(result.question, 'How did you feel about the question?', 'Verify question: How did you feel about the question?');
	strictEqual(result.images, images_arr, "Verify answers: ['bird.png', 'bug.png', 'helicopter.png']");
	// End Test 2
});

test("Suspend SCO", function () {
	SB.debug(">>>>>>>>> Suspending <<<<<<<<<");
	strictEqual(scorm.commit(), 'true', "Committing to check navigation possibilities.");
	if(!local) {
		canContinue = SB.getvalue('adl.nav.request_valid.continue');
		strictEqual(canContinue, 'true', 'Checking for adl.nav.request_valid.continue'); // Check your imss sequencing flow control!!!
		if(canContinue === 'true' || canContinue === 'unknown') {
			//SB.setvalue('adl.nav.request', 'continue'); // Enable if you want it to cruise past this SCO
		}
	}
	//strictEqual(SB.suspend(), 'true', 'Suspending SCO');
	SB.debug("SetValue Calls: " + setvalue_calls + "\nGetValue Calls: " + getvalue_calls, 4);
});
