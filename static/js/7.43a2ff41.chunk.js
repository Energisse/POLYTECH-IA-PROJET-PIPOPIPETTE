(()=>{"use strict";var t={m:{},u:t=>"static/js/"+t+".42225515.chunk.js",o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e),p:"/POLYTECH-IA-PROJET-PIPOPIPETTE/"};t.b=self.location+"/../../../";class e{constructor(t){this.cells=[],this.verticals=[],this.horizontals=[],this.previousBoard=null,this.score=[0,0],this.tour=0,"number"===typeof t?(this.cells=new Array(t).fill(0).map((()=>new Array(t).fill(-1))),this.verticals=new Array(t).fill(0).map((()=>new Array(t+1).fill(-1))),this.horizontals=new Array(t+1).fill(0).map((()=>new Array(t).fill(-1))),this.score=[0,0],this.tour=0):(this.cells=t.cells,this.verticals=t.verticals,this.horizontals=t.horizontals,this.score=t.score,this.tour=t.tour,this.previousBoard=t.previousBoard||null)}getCells(){return this.cells}getVerticals(){return this.verticals}getHorizontals(){return this.horizontals}getScore(){return this.score}getWinner(){return this.score[0]>this.cells.length**2/2?0:this.score[1]>this.cells.length**2/2?1:null}getTour(){return this.tour}play(t,s,i){const o=this.horizontals.map((t=>[...t])),r=this.verticals.map((t=>[...t])),n=this.cells.map((t=>[...t])),a=[...this.score];let l=this.tour;if("vertical"===t){if(-1!==r[i][s])throw new Error("Invalid move");r[i][s]=this.tour}else{if(-1!==o[i][s])throw new Error("Invalid move");o[i][s]=this.tour}const h=[];if("horizontal"===t){let t=this.check(o,r,s,i);t&&h.push(t),t=this.check(o,r,s,i-1),t&&h.push(t)}else{let t=this.check(o,r,s,i);t&&h.push(t),t=this.check(o,r,s-1,i),t&&h.push(t)}return h.length?(a[l]+=h.length,h.forEach((t=>{n[t[1]][t[0]]=l}))):l=1===l?0:1,new e({cells:n,verticals:r,horizontals:o,score:a,tour:l,previousBoard:this})}isFinished(){return this.score[0]>this.cells.length**2/2||this.score[1]>this.cells.length**2/2||this.score[0]+this.score[1]===this.cells.length**2}check(t,e,s,i){var o;return!(s<0||s>=this.cells.length||i<0||i>=this.cells.length)&&(-1!==e[i][s]&&-1!==e[i][s+1]&&-1!==t[i][s]&&-1!==(null===(o=t[i+1])||void 0===o?void 0:o[s])&&[s,i])}evaluation(t){return this.score[t]-this.score[1===t?0:1]}*getNodes(){const t=[...this.verticals.flatMap(((t,e)=>t.map(((t,s)=>({x:s,y:e,value:t,orientation:"vertical"}))))).filter((t=>{let{value:e}=t;return-1===e})),...this.horizontals.flatMap(((t,e)=>t.map(((t,s)=>({x:s,y:e,value:t,orientation:"horizontal"}))))).filter((t=>{let{value:e}=t;return-1===e}))];for(;t.length>0;){const{x:e,y:s,orientation:i}=t.splice(Math.floor(Math.random()*t.length),1)[0],o=this.play(i,e,s);if(o.tour!==o.previousBoard.tour||o.isFinished())yield{x:e,y:s,board:o,orientation:i};else for(const t of o.getNodes())yield{...t,x:e,y:s,orientation:i}}}}class s extends EventTarget{constructor(t,s,i){super(),this.board=void 0,this.players=void 0,this.board=new e(t),this.players=[s,i],this.play()}getBoard(){return this.board}async play(){for(;!this.board.isFinished();)await this.players[this.board.getTour()].play(this.board,this.board.getTour()).then((t=>{const e=this.board.play(t.orientation,t.x,t.y);e&&(this.board=e,this.dispatchEvent(new CustomEvent("played",{detail:{played:{x:t.x,y:t.y,orientation:t.orientation,player:e.previousBoard.tour},board:{verticals:this.board.getVerticals(),horizontals:this.board.getHorizontals(),cells:this.board.getCells(),score:this.board.getScore(),player:this.board.getTour()}}})))}));const[t,e]=this.board.getScore();this.dispatchEvent(new CustomEvent("end",{detail:{winner:t>e?0:t<e?1:-1}}))}async start(){await this.play()}}class i{constructor(t,e,s,i){let o=arguments.length>4&&void 0!==arguments[4]?arguments[4]:null;this.wins=void 0,this.visits=void 0,this.nodes=void 0,this.parent=void 0,this.board=void 0,this.player=void 0,this.simulation=void 0,this.c=void 0,this.generator=void 0,this.wins=0,this.visits=0,this.nodes=new Map,this.parent=o,this.generator=t.getNodes(),this.board=t,this.simulation=s,this.player=e,this.c=i}run(){if(this.board.isFinished()){for(let t=0;t<this.simulation;t++)this.backpropagation(this.simulate());return}let t=this.expansion();if(t)for(let e=0;e<this.simulation;e++)t.backpropagation(t.simulate());else{const{bestNode:t}=this.selection();t.run()}}selection(){let t=null,e=0,s=0,i="vertical",o=-1/0;return this.nodes.forEach(((r,n)=>{r.forEach(((r,a)=>{r.forEach(((r,l)=>{const h=r.wins/r.visits+this.c*Math.sqrt(2*Math.log(this.visits)/r.visits);h>o&&(o=h,i=n,e=+a,s=+l,t=r)}))}))})),{bestNode:t,x:e,y:s,orientation:i}}simulate(){let t=this.board.getNodes(),e=this.board;for(let s of t)e=e.play(s.orientation,s.x,s.y);return e.getWinner()===this.player}expansion(){const{value:t,done:e}=this.generator.next();if(e)return!1;const{orientation:s,x:o,y:r,board:n}=t,a=new i(n,this.player,this.simulation,this.c,this);let l=this.nodes.get(s);l||(l=new Map,this.nodes.set(s,l));let h=l.get(o);return h||(h=new Map,l.set(o,h)),h.set(r,a),a}backpropagation(t){t&&this.wins++,this.visits++,this.parent&&this.parent.backpropagation(t)}getBestChild(){let t=null,e=0,s=0,i="vertical",o=-1/0;return this.nodes.forEach(((r,n)=>{r.forEach(((r,a)=>{r.forEach(((r,l)=>{const h=r.wins/r.visits;h>o&&(i=n,e=+a,s=+l,o=h,t=r)}))}))})),{bestNode:t,x:e,y:s,orientation:i}}getNumberVisited(){return this.visits}}class o extends EventTarget{constructor(){super(...arguments),this.totalTime=0,this.totalMove=0,this.times=[]}}class r extends o{play(t,e){return new Promise((t=>{const s=performance.now();this.addEventListener("play",(i=>{const o=performance.now();this.totalTime+=o-s,this.totalMove++,this.times.push(o-s),console.log(`Player ${e} (${this.constructor.name}) Time: ${o-s} Average time: ${this.totalTime/this.totalMove}ms`);t(i.detail)}),{once:!0})}))}}class n extends o{async play(t,e){return(await Promise.all([(async()=>{const s=performance.now(),i=await this.playIa(t,e),o=performance.now();return this.totalTime+=o-s,this.totalMove++,this.times.push(o-s),console.log(`Player ${e} (${this.constructor.name}) Time: ${o-s} Average time: ${this.totalTime/this.totalMove}ms`),i})(),new Promise((t=>{setTimeout((()=>{t()}),500)}))]))[0]}}class a extends n{constructor(t){let{iteration:e,simulation:s,c:i}=t;super(),this.iteration=void 0,this.simulation=void 0,this.c=void 0,this.lastBoard=null,this.lastNode=null,this.iteration=e,this.simulation=s,this.c=i||Math.sqrt(2)}playIa(t,e){return new Promise((s=>{let o=null;if(this.lastBoard&&this.lastNode){const e=this.lastBoard.getHorizontals().flatMap(((e,s)=>e.map(((e,i)=>-1===e&&-1!==t.getHorizontals()[s][i]?{x:i,y:s,orientation:"horizontal"}:null)))).filter((t=>t)).concat(this.lastBoard.getVerticals().flatMap(((e,s)=>e.map(((e,i)=>-1===e&&-1!==t.getVerticals()[s][i]?{x:i,y:s,orientation:"vertical"}:null)))).filter((t=>t)));0===e.length&&(o=this.lastNode);let s=-1/0;if(e.length>0)for(const t of function(t){let e=[];function s(t,i){if(0===t.length)e.push(i.slice());else for(let e=0;e<t.length;e++){let o=t.slice(),r=o.splice(e,1);s(o,i.concat(r))}}return s(t,[]),e}(e)){var r,n;let e=(null===(r=this.lastNode.nodes.get(t[0].orientation))||void 0===r||null===(n=r.get(t[0].x))||void 0===n?void 0:n.get(t[0].y))||null;for(let s=1;s<t.length;s++){var a,l,h;if(e=(null===(a=e)||void 0===a||null===(l=a.nodes.get(t[s].orientation))||void 0===l||null===(h=l.get(t[s].x))||void 0===h?void 0:h.get(t[s].y))||null,!e)break}e&&e.wins>s&&(s=e.wins,o=e)}}let c=o||new i(t,e,this.simulation,this.c);for(;c.getNumberVisited()<this.iteration*this.simulation;)c.run();this.dispatchEvent(new CustomEvent("tree",{detail:c}));let d=c.getBestChild();this.lastNode=d.bestNode,this.lastBoard=t.play(d.orientation,d.x,d.y),s({x:d.x,y:d.y,orientation:d.orientation})}))}}class l extends n{playIa(t,e){return new Promise((e=>{const{orientation:s,x:i,y:o}=t.getNodes().next().value;e({x:i,y:o,orientation:s})}))}}class h extends n{constructor(t){let{depth:e}=t;super(),this.depth=void 0,this.depth=e}playIa(t,e){return new Promise((s=>{const{nodes:i,...o}=function(t,e,s,i){let o=0,r=0,n="vertical",a=0;const l=function t(s,l,h){if(0===l||s.isFinished())return s.evaluation(i)*(h?1:-1);let c=-1/0;for(const{board:i,x:d,y:u,orientation:p}of s.getNodes()){a++;const s=t(i,l-1,!h);-s>c&&(l===e&&(o=d,r=u,n=p),c=-s)}return c}(t,e,s);return{x:o,y:r,orientation:n,value:l,nodes:a}}(t,this.depth,!0,e);console.log(`Player ${e} (${this.constructor.name}) : ${i} nodes`),s(o)}))}}class c extends n{constructor(t){let{depth:e}=t;super(),this.depth=void 0,this.ias=["minimax","alphabeta","mcts"],this.depth=e}playIa(e,s){const i=[];return Promise.race(this.ias.map((o=>new Promise((r=>{const n=new Worker(new URL(t.p+t.u(856),t.b));i.push(n),n.postMessage({board:JSON.parse(JSON.stringify(e)),depth:this.depth,player:s,type:o}),n.addEventListener("message",(t=>{r([t.data,o])}))}))))).then((t=>{let[e,s]=t;return i.forEach((t=>t.terminate())),console.log(s),e}))}}class d extends n{constructor(t){let{depth:e}=t;super(),this.depth=void 0,this.depth=e}playIa(t,e){return new Promise((s=>{const{nodes:i,...o}=function(t,e,s,i){let o=0,r=0,n="vertical",a=0;const l=function t(s,l,h){let c=arguments.length>3&&void 0!==arguments[3]?arguments[3]:-1/0,d=arguments.length>4&&void 0!==arguments[4]?arguments[4]:1/0;if(0===l||s.isFinished())return s.evaluation(i)*(h?1:-1);let u=-1/0;for(const{board:i,x:p,y:v,orientation:g}of s.getNodes()){a++;const s=t(i,l-1,!h,-d,-c);if(-s>u&&(u=-s,l===e&&(o=p,r=v,n=g)),u>=d)return u;c=Math.max(c,u)}return u}(t,e,s,arguments.length>4&&void 0!==arguments[4]?arguments[4]:-1/0,arguments.length>5&&void 0!==arguments[5]?arguments[5]:1/0);return{value:l,x:o,y:r,orientation:n,nodes:a}}(t,this.depth,!0,e);console.log(`Player ${e} (${this.constructor.name}) : ${i} nodes`),s(o)}))}}DedicatedWorkerGlobalScope.prototype.emit=function(){this.postMessage({type:arguments.length<=0?void 0:arguments[0],data:arguments.length<=1?void 0:arguments[1]})},self.addEventListener("message",(t=>{let{data:{data:e,type:s}}=t;self.dispatchEvent(new CustomEvent(s,{detail:e}))}));let u=null;function p(t){const e=new Array;return t.nodes.forEach(((t,s)=>{t.forEach(((t,s)=>{t.forEach(((t,s)=>{e.push(p(t))}))}))})),{name:`${t.wins}/${t.visits}`,children:e}}function v(t){switch(t.type){case"human":return new r;case"random":return new l;case"minimax":return new h(t);case"alphabeta":return new d(t);case"mcts":return new a(t);case"fastest":return new c(t)}}self.addEventListener("start",(t=>{let{detail:{player1:e,player2:i,size:o}}=t;if(u)return;const n=v(e),a=v(i);n.addEventListener("tree",(t=>{self.emit("tree",{player:1,tree:p(t.detail)})})),a.addEventListener("tree",(t=>{self.emit("tree",{player:2,tree:p(t.detail)})})),u=new s(o,n,a),n instanceof r&&self.addEventListener("play",(t=>{n.dispatchEvent(new CustomEvent("play",{detail:t.detail}))})),a instanceof r&&self.addEventListener("play",(t=>{a.dispatchEvent(new CustomEvent("play",{detail:t.detail}))})),self.emit("change",{verticals:u.getBoard().getVerticals(),horizontals:u.getBoard().getHorizontals(),score:u.getBoard().getScore(),tour:u.getBoard().getTour(),cells:u.getBoard().getCells()}),u.addEventListener("end",(t=>{const{winner:e}=t.detail;self.emit("end",{winner:e})})),u.addEventListener("played",(t=>{const{board:{cells:e,verticals:s,horizontals:i,player:o,score:r}}=t.detail;self.emit("change",{verticals:s,horizontals:i,score:r,tour:o,cells:e})})),u.start().then((()=>{self.emit("end",{winner:u.getBoard().getWinner()})}))}))})();
//# sourceMappingURL=7.43a2ff41.chunk.js.map