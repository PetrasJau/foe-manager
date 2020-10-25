// ==UserScript==
// @name         Forge of Empires Manager
// @description  Forge of Empires Manager
// @author       PetrasJau
// @version      v0.0.0
// @run-at       document-start
// @include      /^(http|https)://[a-z]+[0-9]+\.forgeofempires\.com/game/.*/
// @grant         GM.xmlHttpRequest
// ==/UserScript==

var currentVersionScript = 'https://foeen.innogamescdn.com//cache/ForgeHX-a0ffcb99.js';
var replace = '(function(teb,nh){';
var replaceWith = '(function(teb,nh){ var evaluate = teb.evaluate = function(name){ return eval(name); };';

window.addEventListener('beforescriptexecute',
  function(event)
  {
    var originalScript = event.target;

    if(originalScript.src === currentVersionScript) 
    { 
      var replacementScript = document.createElement('script');
      GM.xmlHttpRequest({
      	method: 'GET',
        url: currentVersionScript,
        synchronous: true,
        onload: function(response) {
          const updated = response.responseText.replace(replace, replaceWith);
          replacementScript.textContent = updated;

          originalScript.parentNode.replaceChild(replacementScript, originalScript);
        }
      });

      event.preventDefault();
    }
  }
);

window.eval(`
function k(a, b) {
  a = Object.create(a);
  for (var c in b)
      a[c] = b[c];
  b.toString !== Object.prototype.toString && (a.toString = b.toString);
  return a
}

window.setTimeout(() => { startGame() }, 2000);

const gameContext = {};

const State = {
  INITIALIZING: 'initializing',
  IDLE: 'idle',
  LOOKING_FOR_QUEST: 'looking for quest',
}

const EventType = {
  QUEST_ADDED: 'quest added',
  INITIALIZED: 'initialized',
}

class StateMachine {
  constructor() {
    this.state = State.INITIALIZING;
  }

  changeState(state, context) {
    this.state = state;
    this.context = context;
  }

  react(event) {
    switch (this.state) {
      case State.INITIALIZING:
        return this.initialize();
      case State.LOOKING_FOR_QUEST:
        return this.lookingForQuest(event);
    }
  }

  initialize() {
    // console.log('initialize');
    initGameContext();
    this.changeState(State.IDLE);
  }

  lookingForQuest(event) {
    // console.log('in machine', event);
    if (this.context.count >= 10) {
      this.changeState(State.IDLE);
      return;
    }
    if (event.type === EventType.QUEST_ADDED) {
      if (event.data.questItemId === this.context.questItemId ) {
        if (event.data.questTitle === this.context.questTitle) {
          this.changeState(State.IDLE);
          return;
        }
        this.changeState(this.state, { ...this.context, count: this.context.count + 1 });
        const mediator = gameContext.mediatorMap.mediatorByView.h[event.data.id];
        // console.log(mediator);
        window.setTimeout(() => {mediator._buttonAbortClicked()}, 0);
      }
    }
  }
}

let stateMachine = new StateMachine();

startGame = function() {
  try {
    gameContext.foeClasses = evaluate('e');
    const mediatorMapClass = gameContext.foeClasses["org.robotlegs.base.MediatorMap"]
    const viewMapBase = gameContext.foeClasses["org.robotlegs.base.ViewMapBase"];
    const copy = { ...mediatorMapClass.prototype };
    const newPrototype = k(viewMapBase.prototype, {
      ...copy,
      onViewAdded: function(addViewCommand) {
        // console.log(addViewCommand.target.__proto__.__class__.__name__, addViewCommand.target.__id__);
        if (addViewCommand.target.__proto__.__class__.__name__ === 'de.innogames.strategycity.main.view.cityhud.components.chat.ChatHeadline') {
          stateMachine.react({ type: EventType.INITIALIZED })
        }
        if (addViewCommand.target.__proto__.__class__.__name__ === 'de.innogames.strategycity.shared.ui.questoverview.QuestItem' && addViewCommand.target.__id__ && addViewCommand.target._quest._vo) {
          try {
          const questData = { className: addViewCommand.target.__proto__.__class__.__name__, questItemId: addViewCommand.target._questItemId, questTitle: addViewCommand.target._quest._vo.title, id: addViewCommand.target.__id__}
          stateMachine.react({ type: EventType.QUEST_ADDED, data: questData })
          } catch (error) {
            console.log(error);
          }
        }
        copy.onViewAdded.call(this, addViewCommand);
      }
    })
    mediatorMapClass.prototype = newPrototype;
    onGameLoaded();
  } catch (error) {
    console.error(error);
  }
}

initGameContext = function() {
  gameContext.baseMain = gameContext.foeClasses['lime.app.Application'].current.stage.__children.find((c) => c.__proto__.__class__.__name__ === "Main");
  gameContext.mainInjector = gameContext.baseMain._context._injector;
  gameContext.mediatorMap = gameContext.mainInjector.getInstanceForMapping('org.robotlegs.core.IMediatorMap')
}

skipUntil = function(questTitle, questPosition) {
  const questItemMediator = Object.values(gameContext.mediatorMap.mediatorByView.h).find(mediator => mediator.view && (mediator.view._questItemId || mediator.view._questItemId === 0) && mediator.view._questItemId === questPosition);
  if (questItemMediator && questItemMediator.view._quest._vo.title !== questTitle) {
    stateMachine.changeState(State.LOOKING_FOR_QUEST, { count: 1, questTitle, questItemId: questPosition });
    questItemMediator._buttonAbortClicked();
  }
}
`);