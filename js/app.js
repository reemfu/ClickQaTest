angular.module('GetCandidatesApp',[]);

angular.module('GetCandidatesApp').controller('FormController', ['$scope', '$rootScope', '$timeout', '$http', function($scope, $rootScope, $timeout, $http) {

    $rootScope.state = 1;
    $rootScope.slots = [];
    $rootScope.results = [];
    $rootScope.appointments = localStorage.getItem('appointments') ? JSON.parse(localStorage.getItem('appointments')) : [];

        $scope.durations = {
        house: 3,
        floor: 2,
        car: 1,
    };

    $scope.availability = {
        james: {start: 8, end: 20, weekend: true},
        alfredo: {start: 6, end: 18, weekend: false},
        ilya: {start: 9, end: 21, weekend: true},
    };


    $http.get('js/user.json')
        .then(function(data) {
            alert('Welcome ' + data.user + '!');
        }).catch(function(err) {
            console.error('UNABLE TO IDENTIFY USER');
            console.error(err);
        });


    // init
    $scope.customer = 'jams';
    $scope.worktype = 'house';


    $scope.$watch('name', function(value) {
        window.document.getElementById('ResultName').innerHTML = value;
    });


    $scope.getCandidates = () => {

        if (!($scope.end instanceof Date)) {
            alert('End date not setted');
            return;
        }


        if ($scope.start === $scope.end) {
            alert('Start and End date can not be the same');
            return;
        }

        $rootScope.state = 2;

        let time = 7,
            dayDiff = ($scope.end - $scope.start) / 1000 / 60 / 60 / 24;

        if (dayDiff < 5) {
            time = dayDiff + 2;
        }

        $timeout(() => {

            if (dayDiff > 30) {
                throw('CPU time limit exceeded: Aborting')
            }

            $rootScope.state = 3;

        }, time * 1000);



        for (let start = new Date($scope.start); start < $scope.end; start.setDate( start.getDate() + 1) ) {

            let daySlots = { date: new Date(start) , slots: [] },
                availability = $scope.availability[$scope.customer];

            // weekends: 5=FRI, 6=SAT
            if (!availability.weekend && start.getDay() === 5) {
                continue;
            }

            for (let i=availability.start; i<availability.end; i++) {

                let slotAlreadyExist = false;

                $rootScope.appointments.forEach(appointment => {

                    if (appointment.start == i) {
                        slotAlreadyExist = true;
                    }

                });

                !slotAlreadyExist && daySlots.slots.push({
                    start: i,
                    end: i+$scope.durations[$scope.worktype],
                    grade: Math.floor(65 + Math.random() * 35),
                    customer: $scope.customer,
                    worktype: $scope.worktype,
                    name: $scope.name
                });

            }

            $rootScope.results.push(daySlots);

        }


    };


    $rootScope.$watch('state', function(newValue, oldValue) {

        if (newValue === 1) {
            $scope.start = undefined;
            $scope.end = undefined;
            $scope.name = undefined;
        }

    });

}]);



angular.module('GetCandidatesApp').controller('LoadingController', ['$scope', '$rootScope', '$timeout', function($scope, $rootScope, $timeout) {


}]);



angular.module('GetCandidatesApp').controller('OptionsController', ['$scope', '$rootScope', '$timeout', function($scope, $rootScope, $timeout) {


    $scope.selectSlot = (slot, date) => {

        $timeout(() => {

            slot.date = date;
            $rootScope.appointments.push(slot);
            $rootScope.lastSlot = slot;
            $rootScope.state = 4;

            let db = localStorage.getItem('appointments') ? JSON.parse(localStorage.getItem('appointments')) : [];
            db.push($rootScope.lastSlot);
            localStorage.setItem('appointments', JSON.stringify(db));
            $scope.saving = false;

        }, 1200);

        $scope.saving = true;

    }


}]);


angular.module('GetCandidatesApp').controller('ResultController', ['$scope', '$rootScope', function($scope, $rootScope) {

    $scope.anotherAppointment = () => $rootScope.state = 1;
    $rootScope.results = [];


}]);


angular.module('GetCandidatesApp').controller('AppointmentsController', ['$scope', '$rootScope', function($scope, $rootScope) {


    $scope.getAvgGrade = () => {

        let grade = 0;
        $rootScope.appointments.forEach(app => grade += app.grade + 7);

        grade = grade / $rootScope.appointments.length;
        grade = Math.floor(grade);

        return grade > 100 ? 99 : grade;

    }

}]);
