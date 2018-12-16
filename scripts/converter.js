function EncodingConverter() {
	var geoToLatinBinding = [
		'a',
		'b',
		'g',
		'd',
		'e',
		'v',
		'z',
		'T',
		'i',
		'k',
		'l',
		'm',
		'n',
		'o',
		'p',
		'zh',
		'r',
		's',
		't',
		'u',
		'f',
		'k',
		'g',
		'k',
		'sh',
		'ch',
		'c',
		'dz',
		'w',
		'W',
		'x',
		'j',
		'h'
	];
	var latinToGeoBinding = [
		'A',
		'B',
		'ჩ',
		'D',
		'E',
		'F',
		'G',
		'H',
		'I',
		'ჟ',
		'K',
		'L',
		'M',
		'N',
		'O',
		'P',
		'Q',
		'ღ',
		'შ',
		'თ',
		'U',
		'V',
		'ჭ',
		'X',
		'Y',
		'ძ',
		'[',
		'\\',
		']',
		'^',
		'_',
		'`',
		'ა',
		'ბ',
		'ც',
		'დ',
		'ე',
		'ფ',
		'გ',
		'ჰ',
		'ი',
		'ჯ',
		'კ',
		'ლ',
		'მ',
		'ნ',
		'ო',
		'პ',
		'ქ',
		'რ',
		'ს',
		'ტ',
		'უ',
		'ვ',
		'წ',
		'ხ',
		'ყ',
		'ზ'
	];

	this.toLatin = function(geoWord) {
		return convert(geoWord, geoToLatinBinding, 'ა', 'ჰ', 4304);
	};

	this.toGeorgian = function(latinWord) {
		return convert(latinWord, latinToGeoBinding, 'A', 'z', 65);
	};

	function convert(word, binding, min, max, charNum) {
		var buffer = [];
		var i = 0;
		word.split('').forEach(function(c) {
			if (c >= min && c <= max) {
				buffer[i++] = binding[c.charCodeAt(0) - charNum];
			} else {
				buffer[i++] = c;
			}
		});
		return buffer.join('');
	}
}
