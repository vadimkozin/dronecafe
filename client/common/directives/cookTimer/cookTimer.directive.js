// директива: Таймер процесса приготовления блюда
// пример:
// <span cook-timer="dish.ts" stateId="dish.stateId" stateStart="1" ></span>
// dish.ts - (Object): штампы времени перехода блюда по состояниям ts={state1:date1, state2:date1, .. state5:date5}
// dish.stateId - (Number): состояние блюда 1-5
// stateStart - (Number): код состояния (1,2) для начала отсчёта таймера

(function () {

angular
    .module('cafeApp')
    .directive('cookTimer', ['$interval', function($interval) {

        function link(scope, element, attrs) {
            let timeoutId,
                stateId = 0,
                startDate = null,
                endDate = null,
                stateStart = 0;

                log = console.log;
  
            function timer(startDate, endDate) { 

                let thisDate = endDate ? endDate : new Date();

                let t = thisDate.getTime() - startDate.getTime();
                let ms = t % 1000; t -= ms; ms = Math.floor(ms/10);
                t = Math.floor (t / 1000);
                let s = t % 60; t -= s;
                t = Math.floor (t/60);
                let m = t % 60; t -= m;
                t = Math.floor (t / 60);
                let h = t % 60;
                if (h < 10) h = '0' + h;
                if (m < 10) m = '0' + m;
                if (s < 10) s = '0' + s;
                if (ms < 10) ms = '0' + ms;

                //return h + ':' + m + ':' + s + '.' + ms;
                return h + ':' + m + ':' + s;
                
            }

            // код состояния(1,2) для начала отсчёта таймера (startDate) 
            scope.$watch(attrs.statestart, function(value) {
                stateStart = value;
            });

            // состояние блюда: 1-5
            scope.$watch(attrs.stateid, function(value) {
                stateId = value;
            });

            // объект: штампы времени перехода блюда по состояниям ts={state1, state2, .. state5}
            scope.$watch(attrs.cookTimer, function(value) {
                
                let ts = value;
        
                // начало отсчёта: ts.state1 для клиента и ts.state2 для повара
                startDate = new Date(ts['state' + stateStart]);
   
                // ts.state4 = ts.state5 = ts.state1 - когда клиент повторяет заказ со скидкой
                // сделано специально, чтобы отловить в этом месте
                if (ts.state4 && ts.state4 != ts.state1) {
                    endDate = new Date(ts.state4);
                }
                if (ts.state5 && ts.state5 != ts.state1) {
                    endDate = new Date(ts.state5);
                }

            });

            function updateTime() {

                element.text(timer(startDate, endDate));

                // переход в 4/5 состояние означает конец процесса                
                if (stateId == 4 || stateId == 5) {
                    $interval.cancel(timeoutId);
                }

            }

            element.on('$destroy', function() {
                $interval.cancel(timeoutId);
            });

            timeoutId = $interval(function() {                
                updateTime(); 
            }, 1000);
        }

        return {
            restrict: 'A',
            link: link,
            scope: false,
        };

    }])

})();