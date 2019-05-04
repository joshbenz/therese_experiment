import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { DataService } from './services/data.service';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import * as CanvasJS from './canvasjs.min';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular-src';
  isAddingData: boolean = false;
  dataForm: FormGroup;
  private debounce: number = 400;

  dogs = ['Myia', 'Mika', 'Ali'];
  bowls = ['White', 'Clear', 'Red', 'Blue', 'Yellow'];
  nVisits = 0;
  isloggingIn = false;
  email = '';
  password='';
  asdf = 'AliIsTheBest';
  ASDF = false;

  gData;
  aliBowlsCheckedWrongWhenWhiteBowlBarChart;
  aliBowlsCheckedWrongWhenBlueBowlBarChart;


  constructor(private _formBuilder: FormBuilder,
              public _authService: AuthService,
              private _dataService: DataService) {
  }

  ngOnInit() {
    //console.log(localStorage.getItem('auth'))
    this.dataForm = this.createForm();
    this.refresh();

    this._dataService.getDatapoints().subscribe(data => {
      for(let dataPoint of data as any) {
        dataPoint.orderOfBowls = JSON.parse(dataPoint.orderOfBowls);
        dataPoint.bowlsVisitedOrder = JSON.parse(dataPoint.bowlsVisitedOrder);
        dataPoint.date = new Date(dataPoint.date);
      }

      this.gData = data;

      //ali charts
      this.aliBowlsCheckedWrongWhenWhiteBowlBarChart = this.bowlsChecked('white', this.deep(data), 'aliBowlsCheckedWrongWhenWhiteBowlBarChart'); this.aliBowlsCheckedWrongWhenWhiteBowlBarChart.render()
      //this.aliBowlsCheckedWrongWhenBlueBowlBarChart = this.bowlsChecked('blue', this.deep(data), 'aliBowlsCheckedWrongWhenBlueBowlBarChart');
      let timScatterCompareChart = this.timScatterCompare(this.deep(data), 'timScatterCompareChart'); timScatterCompareChart.render();

      //comparison charts
      //let nBowlsCheckedScatterCompare = this.nBowlsCheckedCompare(['Ali'], this.deep(data), 'nBowlsCheckedScatterCompare'); nBowlsCheckedScatterCompare.render();
    });
  }

  deep(data) { return JSON.parse(JSON.stringify(data))}

  timScatterCompare(APIdata, id) {
    //let dogsData = [];
    /*for(let i=0; i<dogs.length; i++) {
      dogsData.push(APIdata.filter(x => {return x.dogName.toLowerCase() == dogs[i].toLowerCase()}));
    }*/

    let whiteBowlData = APIdata.filter(x => {
      return ((x.dogName.toLowerCase() == 'ali') &&
              (x.chickenBowl.toLowerCase() == 'white'))
    });

    let blueBowlData =  APIdata.filter(x => {
      return ((x.dogName.toLowerCase() == 'ali') &&
              (x.chickenBowl.toLowerCase() == 'blue'))
    });

    let whiteMap = new Map();
    let blueMap = new Map();
    for(let i=0; i<whiteBowlData.length; i++) {
      if(whiteMap.has(whiteBowlData[i].date)) {
        let tmp = whiteMap.get(whiteBowlData[i].date);
        tmp.push(this.deep(whiteBowlData[i]));
        whiteMap.set(whiteBowlData[i].date, tmp);
      } else {
        let tmp = [];
        tmp.push(this.deep(whiteBowlData[i]));
        whiteMap.set(whiteBowlData[i].date, tmp);
      }
    }


    for(let i=0; i<blueBowlData.length; i++) {
      if(blueMap.has(blueBowlData[i].date)) {
        let tmp = blueMap.get(blueBowlData[i].date);
        tmp.push(this.deep(blueBowlData[i]));
        blueMap.set(blueBowlData[i].date, tmp);
      } else {
        let tmp = [];
        tmp.push(this.deep(blueBowlData[i]));
        blueMap.set(blueBowlData[i].date, tmp);
      }
    }

    let whiteScatterData = [];
    let blueScatterData = [];

    let whiteAvgs = [];
    let blueAvgs = [];

    let counter = 0;
    whiteMap.forEach((value, key) => {
      let sum = 0;
      for(let i=0; i<value.length; i++) {
        whiteScatterData.push({ x: counter+1, y: value[i].timeToChicken });
        sum += value[i].timeToChicken;
      }
      let avg = (sum / value.length);
      whiteAvgs.push({ x: counter+1, y: avg });
      counter++;
    });

    counter = 0;
    blueMap.forEach((value, key) => {
      let sum = 0;
      for(let i=0; i<value.length; i++) {
        blueScatterData.push({ x: counter+1, y: value[i].timeToChicken });
        sum += value[i].timeToChicken;
      }
      let avg = (sum / value.length);
      blueAvgs.push({ x: counter+1, y: avg });
      counter++;
    });


    let scatterData = [{
      type:"scatter",
      toolTipContent: "<span style=\"color:#C0504E \"><b>{name}</b></span><br/><b> Day:</b> {x} <br/><b> Time:</b></span> {y}",
      name: 'Blue Bowl',
      showInLegend: true,
      dataPoints: blueScatterData
    }, {
      type:"scatter",
      toolTipContent: "<span style=\"color:#C0504E \"><b>{name}</b></span><br/><b> Day:</b> {x} <br/><b> Time:</b></span> {y}",
      name: 'White Bowl',
      showInLegend: true,
      dataPoints: whiteScatterData
    }, {
      type:"line",
      toolTipContent: "<span style=\"color:#C0504E \"><b>{name}</b></span><br/><b> Day:</b> {x} <br/><b> Time:</b></span> {y}",
      name: 'White Bowl AVG',
      showInLegend: true,
      dataPoints: whiteAvgs
    }, {
    type:"line",
    toolTipContent: "<span style=\"color:#C0504E \"><b>{name}</b></span><br/><b> Day:</b> {x} <br/><b> Time:</b></span> {y}",
    name: 'Blue Bowl AVG',
    showInLegend: true,
    dataPoints: blueAvgs
    }];


    return new CanvasJS.Chart(id, {
      animationEnabled: true,
      title: { text: "Time to Chicken Bowl Per Day" },
      axisX: { title: "Day #" },
      axisY: { title: "Time to Chicken Bowl" },
      data: scatterData
    
    });
  }

  bowlsChecked(bowl, APIdata, id) {
    let data = APIdata.filter(x => {
      return ((x.dogName.toLowerCase() == 'ali') &&
              (x.chickenBowl.toLowerCase() == bowl))
    });

    let nDataPoints = data.length;

    data = data.filter(x => {
      return (x.bowlsVisitedOrder.length > 1)
    });
    let nWrongBowls = data.length;

    let map:Map<any, any> = new Map();
    for(let d of data) {
      for(let visited of d.bowlsVisitedOrder) {
        if(map.has(visited.bowl)) {
          let count = map.get(visited.bowl);
          count++;
          map.set(visited.bowl, count);
        } else {
          map.set(visited.bowl, 1);
        }
      }
    }

    let datapoints = [];
    map.forEach((value, key) => {
      if(key.toLowerCase() != bowl) {
        datapoints.push({ y: value, label: key });
      }
    });

    return new  CanvasJS.Chart(id, {
      animationEnabled: true,
      theme: "light2",

      title:{
        text: "Frequency of Bowls Visited " + bowl
      },

      axisY: {
        title: "Frequency(# of times visited)"
      },

      data: [{        
        type: "column",  
        showInLegend: true, 
        legendMarkerColor: "grey",
        legendText: nWrongBowls + " of " + nDataPoints + " data points where she guessed wrong",
        dataPoints: datapoints
      }]
    });
  }

  refresh() : void {
    this.dataForm.controls['nBowlsVisited'].valueChanges
      .pipe(debounceTime(this.debounce), distinctUntilChanged())
      .subscribe(query => {
        this.nVisits = query;
        console.log(query);
        const visited = this.dataForm.controls.bowlsVisitedOrder as FormArray;

        for(let i=0; i<this.nVisits; i++) {
            visited.push(this._formBuilder.group({bowl: ''}));
        }

        while(visited.length > this.nVisits) visited.removeAt(visited.length-1);
      });
  }

  addData() { 
    this.isAddingData = true;
    this.refresh();
  }

  createForm() : FormGroup {
    let form =  this._formBuilder.group({
      date : new FormControl(''),
      dogName: new FormControl(''),
      orderOfBowls: this._formBuilder.array([]),
      chickenBowl: new FormControl(''),
      nBowlsVisited: new FormControl(''),
      bowlsVisitedOrder: this._formBuilder.array([]),
      timeToChicken: new FormControl(''),
      comments: new FormControl('')
    });

    const orderBowls = form.controls.orderOfBowls as FormArray;
    for(let i=0; i<this.bowls.length; i++) {
      orderBowls.push(this._formBuilder.group({bowl: ''}));
    }
    
    return form;
  }

  onSubmit() : void {
    let data = Object.assign({}, this.dataForm.getRawValue());
    this.dataForm = this.createForm();
    this.isAddingData = false;

    this._dataService.create(data).subscribe(x => console.log(x));
  }

  onCancel() : void {
    this.dataForm = this.createForm();
    this.isAddingData = false;
    this.isloggingIn = false;
    this.password = '';
  }

  loginSubmit() : void {
    if(this.password == this.asdf) this.ASDF = true;
   // this._authService.login(this.email, this.password).subscribe(t => console.log(t));
    this.isloggingIn = false;
    this.password = '';
  }

  login() : void {
    this.isAddingData = false;
    this.isloggingIn = true;
  }

  downloadData() : void {
    var options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true, 
      showTitle: true,
      title: 'Data Report',
      useBom: true,
      noDownload: false,
      headers: [
        "Date", 
        "Dog", 
        "Initial Order of Bowls",
        "Bowl with Chicken",
        "Number Of Bowls Visited",
        "Oder Bowls Were Visited",
        "Additional Comments"],
      nullToEmptyString: true,
    };

    let dataPoints = [];
    this._dataService.getDatapoints().subscribe(data => {
      for(let dataPoint of data as any) {
        dataPoint.orderOfBowls = JSON.parse(dataPoint.orderOfBowls);
        dataPoint.bowlsVisitedOrder = JSON.parse(dataPoint.bowlsVisitedOrder);


        var tmp = {
          date: new Date(dataPoint.date).toDateString(),
          dog: dataPoint.dogName,
          orderOfBowls: this.bowlsToString(dataPoint.orderOfBowls),
          chickenBowl: dataPoint.chickenBowl,
          nBowlsVisited: dataPoint.nBowlsVisited,
          bowlsVisitedOrder: this.bowlsToString(dataPoint.bowlsVisitedOrder),
          timeToChicken: dataPoint.timeToChicken,
          comments: dataPoint.comments
        };

        dataPoints.push(tmp);
      }

      dataPoints.sort(function(a,b){return new Date(a).getTime() - new Date(b).getTime()});
      new Angular5Csv(dataPoints, "Report", options);
    });
  }

  bowlsToString(arr: any) : string {
    let result = "";

    for(let b of arr) {
      if(b) {
        if(b.bowl) {
          result = result + b.bowl + "-";
        }
      }
    }

    return result;
  }

  toggleBowlFreqChange($event) {
    switch($event.index) {
      case 0: {
        this.aliBowlsCheckedWrongWhenBlueBowlBarChart.destroy();
        this.aliBowlsCheckedWrongWhenWhiteBowlBarChart = this.bowlsChecked('white', this.deep(this.gData), 'aliBowlsCheckedWrongWhenWhiteBowlBarChart');
        this.aliBowlsCheckedWrongWhenWhiteBowlBarChart.render();
      } break;

      case 1: {
        this.aliBowlsCheckedWrongWhenWhiteBowlBarChart.destroy();
        this.aliBowlsCheckedWrongWhenBlueBowlBarChart = this.bowlsChecked('blue', this.deep(this.gData), 'aliBowlsCheckedWrongWhenBlueBowlBarChart');
        this.aliBowlsCheckedWrongWhenBlueBowlBarChart.render();
      } break;
     default: {
      console.log($event);
    }
  }

  }
}
