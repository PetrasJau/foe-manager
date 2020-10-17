// ==UserScript==
// @name         Forge of Empires Manager
// @description  Forge of Empires Manager
// @author       PetrasJau
// @version      v0.0.0
// @run-at       document-start
// @include      /^(http|https)://[a-z]+[0-9]+\.forgeofempires\.com/game/.*/
// @grant         GM.xmlHttpRequest
// ==/UserScript==

var currentVersionScript = 'https://foeen.innogamescdn.com//cache/ForgeHX-0000bb61.js';

window.addEventListener('beforescriptexecute',
  function(event)
  {
    var originalScript = event.target;

    if(originalScript.src === currentVersionScript) 
    { 
      var replacementScript = document.createElement('script');
      console.log(GM.xmlHttpRequest);
      GM.xmlHttpRequest({
      	method: 'GET',
        url: currentVersionScript,
        synchronous: true,
        onload: function(response) {
          const updated = response.responseText.replace('(function(seb,nh){', '(function(seb,nh){ var evaluate = seb.evaluate = function(name){ return eval(name); };');
          replacementScript.textContent = updated;

      		originalScript.parentNode.replaceChild(replacementScript, originalScript);
          window.eval('onGameLoaded();');
        }
      });

      event.preventDefault();
    }
  }
);

window.eval(`
skipUntil = function(questTitle, questPosition, delay) {
  var foeClasses = evaluate('e');
  var baseMain = foeClasses['lime.app.Application'].current.stage.__children.find((c) => c.__proto__.__class__.__name__ === "Main");
  var mainInjector = baseMain._context._injector;
	var mediatorMap = mainInjector.getInstanceForMapping('org.robotlegs.core.IMediatorMap') 
  var count = 0;
  var repeat = function() {
    var questItemMediator = Object.values(mediatorMap.mediatorByView.h).find(mediator => mediator.view && (mediator.view._questItemId || mediator.view._questItemId === 0) && mediator.view._questItemId === questPosition);
    if (count < 10 && questItemMediator && questItemMediator.view._quest._vo.title !== questTitle) {
      questItemMediator._buttonAbortClicked();
      count++;
      window.setTimeout(repeat, delay);
    }
  }
  repeat();
}
`);