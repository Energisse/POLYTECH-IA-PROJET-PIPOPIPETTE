(()=>{"use strict";var t={4472:(t,e,s)=>{EventTarget;class i extends EventTarget{constructor(t){super(),this.cells=[],this.verticals=[],this.horizontals=[],this.score=[0,0],this.tour=0,"number"===typeof t?(this.cells=new Array(t).fill(0).map((()=>new Array(t).fill(-1))),this.verticals=new Array(t).fill(0).map((()=>new Array(t+1).fill(-1))),this.horizontals=new Array(t+1).fill(0).map((()=>new Array(t).fill(-1))),this.score=[0,0],this.tour=0):(this.cells=t.cells,this.verticals=t.verticals,this.horizontals=t.horizontals,this.score=t.score,this.tour=t.tour)}getCells(){return this.cells}getVerticals(){return this.verticals}getHorizontals(){return this.horizontals}getScore(){return this.score}getTour(){return this.tour}play(t,e,s){if("vertical"===t){if(-1!==this.verticals[s][e])return;this.verticals[s][e]=this.tour}else{if(-1!==this.horizontals[s][e])return;this.horizontals[s][e]=this.tour}const i=[];if("horizontal"===t){let t=this.check(e,s);t&&i.push(t),t=this.check(e,s-1),t&&i.push(t)}else{let t=this.check(e,s);t&&i.push(t),t=this.check(e-1,s),t&&i.push(t)}if(i.length?(this.score[this.tour]+=i.length,i.forEach((t=>{this.cells[t[1]][t[0]]=this.tour}))):this.tour=1===this.tour?0:1,this.dispatchEvent(new CustomEvent("boardChange",{detail:{verticals:this.verticals,horizontals:this.horizontals,cells:this.cells,score:this.score}})),this.isFinished()){const t=this.score[0]===this.score[1]||this.score[0]>this.score[1]?0:1;this.dispatchEvent(new CustomEvent("end",{detail:{winner:t}}))}}isFinished(){return this.score[0]>this.cells.length**2/2||this.score[1]>this.cells.length**2/2||this.score[0]+this.score[1]===this.cells.length**2}check(t,e){var s;return!(t<0||t>=this.cells.length||e<0||e>=this.cells.length)&&(-1!==this.verticals[e][t]&&-1!==this.verticals[e][t+1]&&-1!==this.horizontals[e][t]&&-1!==(null===(s=this.horizontals[e+1])||void 0===s?void 0:s[t])&&[t,e])}evaluation(t){return this.score[t]-this.score[1===t?0:1]}copy(){const t=new i(this.cells.length);return t.cells=this.cells.map((t=>[...t])),t.verticals=this.verticals.map((t=>[...t])),t.horizontals=this.horizontals.map((t=>[...t])),t.score=[...this.score],t.tour=this.tour,t}*getNodesVertical(){const t=this.verticals.flatMap(((t,e)=>t.map(((t,s)=>({x:s,y:e,value:t}))))).filter((t=>{let{value:e}=t;return-1===e}));for(;t.length>0;){const{x:e,y:s}=t.splice(Math.floor(Math.random()*t.length),1)[0],i=this.copy(),o=i.tour;if(i.play("vertical",e,s),i.tour!==o||i.isFinished())yield{x:e,y:s,board:i,orientation:"vertical"};else for(const t of i.getNodes())yield{...t,x:e,y:s,orientation:"vertical"}}}*getNodesHorizontal(){const t=this.horizontals.flatMap(((t,e)=>t.map(((t,s)=>({x:s,y:e,value:t}))))).filter((t=>{let{value:e}=t;return-1===e}));for(;t.length>0;){const{x:e,y:s}=t.splice(Math.floor(Math.random()*t.length),1)[0],i=this.copy(),o=i.tour;if(i.play("horizontal",e,s),i.tour!==o||i.isFinished())yield{x:e,y:s,board:i,orientation:"horizontal"};else for(const t of i.getNodes())yield{...t,x:e,y:s,orientation:"horizontal"}}}*getNodes(){const t=this.getNodesVertical(),e=this.getNodesHorizontal();let s=!1,i=!1;for(;!s&&!i;)if(Math.random()<.5){const{value:e,done:s}=t.next();s?i=!0:yield e}else{const{value:t,done:i}=e.next();i?s=!0:yield t}if(!s)for(const o of e)yield o;if(!i)for(const o of t)yield o}}class o{constructor(t,e,s,i){let o=arguments.length>4&&void 0!==arguments[4]?arguments[4]:null;this.wins=void 0,this.visits=void 0,this.nodes=void 0,this.parent=void 0,this.board=void 0,this.player=void 0,this.simulation=void 0,this.c=void 0,this.generator=void 0,this.wins=0,this.visits=0,this.nodes=new Map,this.parent=o,this.generator=t.getNodes(),this.board=t,this.simulation=s,this.player=e,this.c=i}run(){if(this.board.isFinished()){for(let t=0;t<this.simulation;t++)this.backpropagation(this.simulate());return}let t=this.expansion();if(t)for(let e=0;e<this.simulation;e++)t.backpropagation(t.simulate());else{const{bestNode:t}=this.selection();t.run()}}selection(){let t=null,e=0,s=0,i="vertical",o=-1/0;return this.nodes.forEach(((n,r)=>{n.forEach(((n,a)=>{n.forEach(((n,l)=>{const h=n.wins/n.visits+this.c*Math.sqrt(2*Math.log(this.visits)/n.visits);h>o&&(o=h,i=r,e=+a,s=+l,t=n)}))}))})),{bestNode:t,x:e,y:s,orientation:i}}simulate(){let t=this.board.getNodes();const e=this.board.copy();for(let s of t)if(e.play(s.orientation,s.x,s.y),s.board.isFinished())break;return e.getScore()[this.player]>e.getScore()[1===this.player?0:1]}expansion(){const{value:t,done:e}=this.generator.next();if(e)return!1;const{orientation:s,x:i,y:n,board:r}=t,a=new o(r,this.player,this.simulation,this.c,this);let l=this.nodes.get(s);l||(l=new Map,this.nodes.set(s,l));let h=l.get(i);return h||(h=new Map,l.set(i,h)),h.set(n,a),a}backpropagation(t){t&&this.wins++,this.visits++,this.parent&&this.parent.backpropagation(t)}getBestChild(){let t=null,e=0,s=0,i="vertical",o=-1/0;return this.nodes.forEach(((n,r)=>{n.forEach(((n,a)=>{n.forEach(((n,l)=>{const h=n.wins/n.visits;h>o&&(i=r,e=+a,s=+l,o=h,t=n)}))}))})),{bestNode:t,x:e,y:s,orientation:i}}getNumberVisited(){return this.visits}}class n extends EventTarget{constructor(){super(...arguments),this.totalTime=0,this.totalMove=0,this.times=[]}}class r extends n{play(t,e){return new Promise((t=>{const s=performance.now();this.addEventListener("play",(i=>{const o=performance.now();this.totalTime+=o-s,this.totalMove++,this.times.push(o-s),console.log("Player ".concat(e," (").concat(this.constructor.name,") Time: ").concat(o-s," Average time: ").concat(this.totalTime/this.totalMove,"ms"));t(i.detail)}),{once:!0})}))}}class a extends n{async play(t,e){return(await Promise.all([(async()=>{const s=performance.now(),i=await this.playIa(t,e),o=performance.now();return this.totalTime+=o-s,this.totalMove++,this.times.push(o-s),console.log("Player ".concat(e," (").concat(this.constructor.name,") Time: ").concat(o-s," Average time: ").concat(this.totalTime/this.totalMove,"ms")),i})(),new Promise((t=>{setTimeout((()=>{t()}),500)}))]))[0]}}class l extends a{constructor(t){let{iteration:e,simulation:s,c:i}=t;super(),this.iteration=void 0,this.simulation=void 0,this.c=void 0,this.lastBoard=null,this.lastNode=null,this.iteration=e,this.simulation=s,this.c=i||Math.sqrt(2)}playIa(t,e){return new Promise((s=>{let i=null;if(this.lastBoard&&this.lastNode){const e=this.lastBoard.getHorizontals().flatMap(((e,s)=>e.map(((e,i)=>-1===e&&-1!==t.getHorizontals()[s][i]?{x:i,y:s,orientation:"horizontal"}:null)))).filter((t=>t)).concat(this.lastBoard.getVerticals().flatMap(((e,s)=>e.map(((e,i)=>-1===e&&-1!==t.getVerticals()[s][i]?{x:i,y:s,orientation:"vertical"}:null)))).filter((t=>t)));0===e.length&&(i=this.lastNode);let s=-1/0;if(e.length>0)for(const t of function(t){let e=[];function s(t,i){if(0===t.length)e.push(i.slice());else for(let e=0;e<t.length;e++){let o=t.slice(),n=o.splice(e,1);s(o,i.concat(n))}}return s(t,[]),e}(e)){var n,r;let e=(null===(n=this.lastNode.nodes.get(t[0].orientation))||void 0===n||null===(r=n.get(t[0].x))||void 0===r?void 0:r.get(t[0].y))||null;for(let s=1;s<t.length;s++){var a,l,h;if(e=(null===(a=e)||void 0===a||null===(l=a.nodes.get(t[s].orientation))||void 0===l||null===(h=l.get(t[s].x))||void 0===h?void 0:h.get(t[s].y))||null,!e)break}e&&e.wins>s&&(s=e.wins,i=e)}}let c=i||new o(t,e,this.simulation,this.c);for(;c.getNumberVisited()<this.iteration*this.simulation;)c.run();this.dispatchEvent(new CustomEvent("tree",{detail:c}));let d=c.getBestChild();this.lastNode=d.bestNode,t.play(d.orientation,d.x,d.y),this.lastBoard=t.copy(),s({x:d.x,y:d.y,orientation:d.orientation})}))}}class h extends a{playIa(t,e){return new Promise((e=>{const{orientation:s,x:i,y:o}=t.getNodes().next().value;e({x:i,y:o,orientation:s})}))}}class c extends a{constructor(t){let{depth:e}=t;super(),this.depth=void 0,this.depth=e}playIa(t,e){return new Promise((s=>{const{nodes:i,...o}=function(t,e,s,i){const o=new Map;let n=0;const r=function t(e,s,r){if(0===s||e.isFinished())return e.evaluation(i)*(r?1:-1);let a=-1/0;for(const{board:i,x:l,y:h,orientation:c}of e.getNodes()){n++;const e=t(i,s-1,!r);-e>a&&(o.set(s,{x:l,y:h,orientation:c}),a=-e)}return a}(t,e,s);return{...o.get(e),value:r,nodes:n}}(t,this.depth,!0,e);console.log("Player ".concat(e," (").concat(this.constructor.name,") : ").concat(i," nodes")),s(o)}))}}class d extends a{constructor(t){let{depth:e}=t;super(),this.depth=void 0,this.depth=e}playIa(t,e){return new Promise((s=>{const{nodes:i,...o}=function(t,e,s,i){let o=arguments.length>4&&void 0!==arguments[4]?arguments[4]:-1/0,n=arguments.length>5&&void 0!==arguments[5]?arguments[5]:1/0;const r=new Map;let a=0;const l=function t(e,s,o){let n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:-1/0,l=arguments.length>4&&void 0!==arguments[4]?arguments[4]:1/0;if(0===s||e.isFinished())return e.evaluation(i)*(o?1:-1);let h=-1/0;for(const{board:i,x:c,y:d,orientation:u}of e.getNodes()){a++;const e=t(i,s-1,!o,-l,-n);if(-e>h&&(h=-e,r.set(s,{x:c,y:d,orientation:u})),h>=l)return h;n=Math.max(n,h)}return h}(t,e,s,o,n);return{value:l,...r.get(e),nodes:a}}(t,this.depth,!0,e);console.log("Player ".concat(e," (").concat(this.constructor.name,") : ").concat(i," nodes")),s(o)}))}}console.log=()=>{},self.addEventListener("message",(t=>{let e,{data:{board:s,player:o,type:n}}=t;switch(n){case"human":e=new r;break;case"random":e=new h;break;case"minimax":e=new c({depth:3});break;case"alphabeta":e=new d({depth:3});break;case"mcts":e=new l({iteration:1e3,c:1.41,simulation:10});break;default:throw new Error("Invalid player type")}e.play(new i(s),o).then((t=>{self.postMessage(t)}))}))}},e={};e.m=t,e.u=t=>"static/js/"+t+".845317df.chunk.js",e.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),e.p="/POLYTECH-IA-PROJET-PIPOPIPETTE/",e.b=self.location+"/../../../";t[4472](0,{},e)})();
//# sourceMappingURL=472.845317df.chunk.js.map