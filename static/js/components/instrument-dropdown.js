export const instrumentHTML = `
<select class="instrument-map mb-3" name="instrument">
  <option value="" disabled selected>Select an instrument</option>

  <optgroup label="Strings">
    <option value="violin">Violin</option>
    <option value="viola">Viola</option>
    <option value="cello">Cello</option>
    <option value="doubleBass">Double Bass</option>
    <option value="harp">Harp</option>
  </optgroup>

  <optgroup label="Woodwinds">
    <option value="piccolo">Piccolo</option>
    <option value="flute">Flute</option>
    <option value="oboe">Oboe</option>
    <option value="englishHorn">English Horn</option>
    <option value="clarinetEb">E♭ Clarinet</option>
    <option value="clarinetBb">B♭ Clarinet</option>
    <option value="bassClarinet">Bass Clarinet</option>
    <option value="contraClarinet">Contrabass Clarinet</option>
    <option value="bassoon">Bassoon</option>
    <option value="contrabassoon">Contrabassoon</option>
  </optgroup>

  <optgroup label="Saxophones">
    <option value="sopranoSax">Soprano Saxophone</option>
    <option value="altoSax">Alto Saxophone</option>
    <option value="tenorSax">Tenor Saxophone</option>
    <option value="baritoneSax">Baritone Saxophone</option>
    <option value="bassSax">Bass Saxophone</option>
  </optgroup>

  <optgroup label="Brass">
    <option value="trumpet">Trumpet</option>
    <option value="cornet">Cornet</option>
    <option value="flugelhorn">Flugelhorn</option>
    <option value="frenchHorn">French Horn</option>
  </optgroup>

  <optgroup label="Low Brass">
    <option value="trombone">Trombone</option>
    <option value="bassTrombone">Bass Trombone</option>
    <option value="euphonium">Euphonium</option>
    <option value="baritoneHorn">Baritone Horn</option>
    <option value="tuba">Tuba</option>
  </optgroup>

  <optgroup label="Percussion">
    <option value="snareDrum">Snare Drum</option>
    <option value="bassDrum">Bass Drum</option>
    <option value="cymbals">Cymbals</option>
    <option value="timpani">Timpani</option>
    <option value="xylophone">Xylophone</option>
    <option value="marimba">Marimba</option>
    <option value="vibraphone">Vibraphone</option>
    <option value="glockenspiel">Glockenspiel</option>
    <option value="drumSet">Drum Set</option>
    <option value="multiPercussion">Multi-Percussion Setup</option>
    <option value="accessoryPercussion">Accessory Percussion</option>
    <option value="percussionOther">Other / Unlisted Percussion</option>
  </optgroup>

  <optgroup label="Other">
    <option value="piano">Piano</option>
    <option value="organ">Organ</option>
    <option value="celesta">Celesta</option>
    <option value="guitar">Guitar</option>
    <option value="electricGuitar">Electric Guitar</option>
    <option value="bassGuitar">Bass Guitar</option>
    <option value="ukulele">Ukulele</option>
    <option value="voice">Voice</option>
    <option value="other">Other</option>
  </optgroup>
</select>
`;
