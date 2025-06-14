/* Where your helper functions (random # generator, etc) live. Not necessary but
I find it helpful for decluttering. */

// random int generator
const getRandomInt = function(min, max) {
	min = Math.ceil(min);
  	max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// function that calls Papa.parse as a promise to load csv sequence
Papa.parsePromise = function(file) {
	return new Promise(function(complete,error) {
		Papa.parse(file, {
			download: true,
			header: false,
			dynamicTyping: true,
			complete, error
		});
	});
};