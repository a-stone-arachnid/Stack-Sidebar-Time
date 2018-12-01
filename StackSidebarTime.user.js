// ==UserScript==
// @name     Sidebar Stack Clock
// @author   a stone arachnid
// @version  1
// @grant    none
// @require  https://cdnjs.cloudflare.com/ajax/libs/rxjs/6.3.3/rxjs.umd.min.js
// @require  https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js
// ==/UserScript==

(function($){
  const styles = `
#stackClock{padding-top:16px}
#stackClock .part{padding-bottom:28px;position:relative;display:inline-block}
#stackClock .part > h1{position:absolute;font-size:14px;font-family:sans-serif;bottom:0;left:0;right:0;text-align:center}
#stackClock .stack{position:relative;width:40px;box-sizing:border-box;list-style-type:none;margin:0;padding:7px;display:inline-block}
#stackClock .stack::after{content:'';border:solid 4px #BCBBBB;border-top:none;display:block;position:absolute;height:10px;bottom:0;left:0;right:0}
#stackClock .stack > .bar{background-color:#BCBBBB;width:100%;margin-top:3px;height:4px}#stackClock .stack > .bar.active{background-color:#F48023}
  `;
  const html = `
    <div id="stackClock">
      <div class="part" id="hour">
        <h1>Hour</h1>
        <div class="stack">
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
        </div>
        <ul class="stack">
          <li class="bar"></li>
          <li class="bar"></li>
          <li class="bar"></li>
          <li class="bar"></li>
        </ul>
      </div>
      <div class="part" id="minute">
        <h1>Minute</h1>
        <ul class="stack">
          <li class="bar"></li>
          <li class="bar"></li>
          <li class="bar"></li>
          <li class="bar"></li>
        </ul>
        <ul class="stack">
          <li class="bar"></li>
          <li class="bar"></li>
          <li class="bar"></li>
          <li class="bar"></li>
        </ul>
      </div>
      <div class="part" id="second">
        <h1>Second</h1>
        <ul class="stack">
          <li class="bar"></li>
          <li class="bar"></li>
          <li class="bar"></li>
          <li class="bar"></li>
        </ul>
        <ul class="stack">
          <li class="bar"></li>
          <li class="bar"></li>
          <li class="bar"></li>
          <li class="bar"></li>
        </ul>
      </div>
    </div>

    <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet" />
`;
  $('<style></style>').attr("type","text/css").text(styles).appendTo($("head"));
  $('<div></div>').attr("id","sc00_49").html(html).appendTo($(".left-sidebar--sticky-container"));
  
  const { from, interval } = rxjs;
  const { map, switchMap } = rxjs.operators;

  const extract = {
    hour: date => date.format('HH'),
    minute: date => date.format('mm'),
    second: date => date.format('ss')
  };

  interval(1000).pipe(map(_ => moment()),switchMap(getDigits),switchMap(getDigit),map(getBinary),switchMap(getBinaryDigits)).subscribe(showBar);

  function getDigits(date) {
    return from(Object.entries(extract)).pipe(
      map(([type, digits]) => ({type, value: digits(date)}))
    );
  }

  function getDigit({type, value}) {
    return from(value.split('')).pipe(
      map((digit, index) => ({type, index, digit}))
    );
  }

  function getBinary({type, index, digit}) {
    const binary = parseInt(digit).toString(2);
    return {type, index, binary: '0000'.substr(binary.length) + binary};
  }

  function getBinaryDigits({type, index, binary}) {
    return from(binary.split('')).pipe(
      map((digit, binaryIndex) => ({type, index, digit, binaryIndex}))
    );
  }

  function showBar({type, index, binaryIndex, digit}) {
    const classList = document
    .getElementById(type)
    .querySelectorAll('.stack')
    .item(index)
    .querySelectorAll('.bar')
    .item(binaryIndex)
    .classList;
    digit == '0' ? classList.remove('active') : classList.add('active');
  }
})(window.jQuery);
