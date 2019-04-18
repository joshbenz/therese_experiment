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

      //ali charts
      let aliBowlsCheckedBarChart = this.bowlsChecked('Ali', this.deep(data), 'aliBowlsCheckedBarChart'); aliBowlsCheckedBarChart.render();

      //comparison charts
      let nBowlsCheckedScatterCompare = this.nBowlsCheckedCompare(['Ali'], this.deep(data), 'nBowlsCheckedScatterCompare'); nBowlsCheckedScatterCompare.render();
    });
  }

  deep(data) { return JSON.parse(JSON.stringify(data))}

  nBowlsCheckedCompare(dogs, APIdata, id) {
    let dogsData = [];
    for(let i=0; i<dogs.length; i++) {
      dogsData.push(APIdata.filter(x => {return x.dogName.toLowerCase() == dogs[i].toLowerCase()}));
    }

    let dogMaps = [];
    for(let i=0; i<dogsData.length; i++) {
      for(let j=0; j<dogsData[i].length; j++) {
        var map = new Map();
        if(map.has(dogsData[i][j].date)) {
          let tmp = map.get(dogsData[i][j].date);
          tmp.push(this.deep(dogsData[i][j]));
          map.set(dogsData[i][j].date, tmp);
        } else {
          let tmp = [];
          tmp.push(this.deep(dogsData[i][j]));
          map.set(dogsData[i][j].date, tmp);
        }
      }
      dogMaps.push(map);
    }

    let scatterData = [];
    for(let i=0; i<dogMaps.length; i++) {
      dogMaps[i].forEach((value, key) => {
        let datapoints = [];
        //construct data points
        for(let j=0; j<value.length; j++) {
          datapoints.push({ x: j+1, y: value[j].nBowlsVisited });
        }
        
        //construct scatter graph
        scatterData.push({
          type:"scatter",
          toolTipContent: "<span style=\"color:#C0504E \"><b>{name}</b></span><br/><b> Day:</b> {x} <br/><b> # of bowls:</b></span> {y}",
          name: value[0].dogName,
          showInLegend: true,
          dataPoints: datapoints
        });
      });
    }

    return new CanvasJS.Chart(id, {
      animationEnabled: true,
      title: { text: "Number of bowls visited dog comparison" },
      axisX: { title: "Date" },
      axisY: { title: "Number Bowls Visited" },
      data: scatterData
    
    });
  }

  bowlsChecked(dog, APIdata, id) {
    let data = APIdata.filter(x => {return x.dogName.toLowerCase() == dog.toLowerCase()});

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
      datapoints.push({ y: value, label: key });
    })

    return new  CanvasJS.Chart(id, {
      animationEnabled: true,
      theme: "light2",

      title:{
        text: "Frequency of Bowls Visited by " + dog
      },

      axisY: {
        title: "Frequency(# of times visited)"
      },

      data: [{        
        type: "column",  
        showInLegend: true, 
        legendMarkerColor: "grey",
        legendText: "In case we want a legend here",
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
}
