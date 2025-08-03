export const instrumentMap = {
	// Strings
	violin: "Violin",
	viola: "Viola",
	cello: "Cello",
	doubleBass: "Double Bass",
	harp: "Harp",

	// Woodwinds
	piccolo: "Piccolo",
	flute: "Flute",
	oboe: "Oboe",
	englishHorn: "English Horn",
	clarinetEb: "E♭ Clarinet",
	clarinetBb: "B♭ Clarinet",
	bassClarinet: "Bass Clarinet",
	contraClarinet: "Contrabass Clarinet",
	bassoon: "Bassoon",
	contrabassoon: "Contrabassoon",

	// Saxophones
	sopranoSax: "Soprano Saxophone",
	altoSax: "Alto Saxophone",
	tenorSax: "Tenor Saxophone",
	baritoneSax: "Baritone Saxophone",
	bassSax: "Bass Saxophone",

	// Brass
	trumpet: "Trumpet",
	cornet: "Cornet",
	flugelhorn: "Flugelhorn",
	frenchHorn: "French Horn",

	// Low Brass
	trombone: "Trombone",
	bassTrombone: "Bass Trombone",
	euphonium: "Euphonium",
	baritoneHorn: "Baritone Horn",
	tuba: "Tuba",

	// Percussion
	snareDrum: "Snare Drum",
	bassDrum: "Bass Drum",
	cymbals: "Cymbals",
	timpani: "Timpani",
	xylophone: "Xylophone",
	marimba: "Marimba",
	vibraphone: "Vibraphone",
	glockenspiel: "Glockenspiel",
	drumSet: "Drum Set",
	multiPercussion: "Multi-Percussion Setup",
	accessoryPercussion: "Accessory Percussion",
	percussionOther: "Other / Unlisted Percussion",

	// Other
	piano: "Piano",
	organ: "Organ",
	celesta: "Celesta",
	guitar: "Guitar",
	electricGuitar: "Electric Guitar",
	bassGuitar: "Bass Guitar",
	ukulele: "Ukulele",
	voice: "Voice",
	other: "Other",
};

export const reverseInstrumentMap = Object.fromEntries(
	Object.entries(instrumentMap).map(([key, value]) => [value, key])
);
