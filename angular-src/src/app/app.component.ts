import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DataService } from './services/data.service';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import * as CanvasJS from './canvasjs.min';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as moment from 'moment';


interface DogData {
  date : any;
  dogName: string;
  orderOfBowls: any;
  chickenBowl: string;
  nBowlsVisited: number;
  bowlsVisitedOrder: any;
  timeToChicken: number;
  comments: any;
};


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Dog Experiment';
  isAddingData: boolean = false;
  dataForm: FormGroup;
  private debounce: number = 400;

  dogs = ['Myia', 'Mika', 'Ali'];
  bowls = ['White', 'Clear', 'Red', 'Blue', 'Yellow'];
  nVisits = 0;
  isloggingIn = false;
  email = '';
  password='';
  asdf = 'short7';
  ASDF = false;

  gData;
  aliBowlsCheckedWrongWhenWhiteBowlBarChart;
  aliBowlsCheckedWrongWhenBlueBowlBarChart;

  isInitialOrderMatterWhite;
  isInitialOrderMatterBlue;
  isInitialOrderMatterAll;
  successDataBarGraphData;
  firstDate;
  secondDate;

  editing = {};
  rows = [];


  constructor(private _formBuilder: FormBuilder,
              private _dataService: DataService) {
    
  }

  ngOnInit() {
    this.dataForm = this.createForm();
    this.refresh();

    this._dataService.getDatapoints().subscribe(data => {
      for(let dataPoint of data as any) {
        dataPoint.orderOfBowls = JSON.parse(dataPoint.orderOfBowls);
        dataPoint.bowlsVisitedOrder = JSON.parse(dataPoint.bowlsVisitedOrder);
        dataPoint.date = new Date(dataPoint.date);

        if(dataPoint.comments.length <= 0) {
          dataPoint.comments = "None";
        }
      }
      data.sort(function(a:DogData, b:DogData){return new Date(a.date).getTime() - new Date(b.date).getTime()});
      this.gData = data;
      this.rows = data;


      //ali charts
      let allBowlsCheckedBarGraph = this.allBowlsChecked(this.deep(data), 'allBowlsCheckedBarGraph'); allBowlsCheckedBarGraph.render();
      this.aliBowlsCheckedWrongWhenWhiteBowlBarChart = this.bowlsChecked('white', this.deep(data), 'aliBowlsCheckedWrongWhenWhiteBowlBarChart'); this.aliBowlsCheckedWrongWhenWhiteBowlBarChart.render()
      let timScatterCompareChart = this.timScatterCompare(this.deep(data), 'timScatterCompareChart'); timScatterCompareChart.render();
      this.isInitialOrderMatterWhite = this.doesInitOrderMatter(this.deep(data), 'white', 'isInitialOrderMatterWhite'); this.isInitialOrderMatterWhite.render();
      this.successDataBarGraphData = this.allBowlsChecked(this.deep(data), 'successDataBarGraphData'); this.successDataBarGraphData.render();
    });
  }

  allBowlsChecked(APIdata, id) {
    let data  = APIdata.filter(x => {
      return ((x.dogName.toLowerCase() == 'ali'))
    });

    let tmp = data.filter(x => {
      return (x.bowlsVisitedOrder.length > 1)
    });

    let nWorngBowls = tmp.length;
    let nDataPoints = data.length;

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
    });

    return new  CanvasJS.Chart(id, {
      animationEnabled: true,
      theme: "light2",

      title:{
        text: "Frequency of Bowls Visited "
      },

      axisY: {
        title: "Frequency(# of times visited)"
      },

      data: [{        
        type: "column",  
        showInLegend: true, 
        legendMarkerColor: "grey",
        legendText: nWorngBowls + " of " + nDataPoints + " data points where she guessed wrong",
        //legendText: data.length + " datapoints",
        dataPoints: datapoints
      }]
    });
  }

    filterDateRange(items, startDate, endDate) {
      //an undefined startDate is converted to the beginning of time

      startDate = startDate || 0;
  
      const granularity = 'days' // can be 'days', ... see momentJS doc
  
      //you need support for array.prototype.filter and arrow functions; i.e. IE sucks/needs a polyfill   
      return items.filter(item => moment(new Date(item.date)).isBetween(startDate, endDate, granularity, '[]'));
    }

  updateGraph() {

    let data = this.filterDateRange(this.deep(this.gData), new Date(this.firstDate), new Date(this.secondDate));
    console.log(data)
    //console.log(this.secondDate)

    this.destroyGraph(this.successDataBarGraphData);
    this.successDataBarGraphData = this.allBowlsChecked(this.deep(data), 'successDataBarGraphData');
    this.successDataBarGraphData.render();     
  }

  deep(data) { return JSON.parse(JSON.stringify(data))}

  doesInitOrderMatter(APIdata, bowl, id) {
    let data = [];

    switch(bowl) {
      case 'blue': {
        data = APIdata.filter(x => {
          return ((x.dogName.toLowerCase() == 'ali') &&
                  (x.chickenBowl.toLowerCase() == 'blue'))
        });
      } break;

      case 'white': {
        data = APIdata.filter(x => {
          return ((x.dogName.toLowerCase() == 'ali') &&
                  (x.chickenBowl.toLowerCase() == 'white'))
        });
      } break;

      case 'all': {
        data = APIdata.filter(x => {
          return ((x.dogName.toLowerCase() == 'ali'))
        });
      } break;

      default: return;
    }

    let map = new Map();
    for(let i=0; i<data.length; i++) {
      let bowlOrder = '';
      for(let j=0; j<data[i].orderOfBowls.length; j++) {
        bowlOrder = bowlOrder + data[i].orderOfBowls[j].bowl.trim() + ' ';
      }

      bowlOrder = bowlOrder.trim();

      if(map.has(bowlOrder)) {
        let tmp = map.get(bowlOrder);
        tmp += data[i].nBowlsVisited;
        map.set(bowlOrder as string, tmp);
      } else {
        map.set(bowlOrder as string, data[i].nBowlsVisited);
      }
    }

    let plotData = [];
    map.forEach((value, key) => {
      plotData.push({ label: key, y: value });
    });

    return new CanvasJS.Chart(id, {
      animationEnabled: true,
      title: { text: "Bowl Configuration VS # Bowls Visited" },
      axisX: { title: "Configuration", labelAngle: -60,  interval: 1},
      axisY: { title: "# of visits", includeZero: false },
      data:  [{ type: "line",
        toolTipContent: "<span style=\"color:#C0504E \"><b>{name}</b></span><br/><b> Order:</b> {label} <br/><b> Visits:</b></span> {y}",
        name: bowl + ' Bowl',
        showInLegend: true,
        dataPoints: plotData
      }] 
    });
  }  

  timScatterCompare(APIdata, id) {

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
          result = result + b.bowl + " ";
        }
      }
    }

    return result.trim();
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

  toggleisInitialOrderMatter($event) {
    switch($event.index) {
      case 0: {
        this.destroyGraph(this.isInitialOrderMatterWhite);
        this.destroyGraph(this.isInitialOrderMatterBlue);
        this.destroyGraph(this.isInitialOrderMatterAll);

        this.isInitialOrderMatterWhite = this.doesInitOrderMatter(this.deep(this.gData), 'white', 'isInitialOrderMatterWhite');
        this.isInitialOrderMatterWhite.render();        
      } break;

      case 1: {
        this.destroyGraph(this.isInitialOrderMatterWhite);
        this.destroyGraph(this.isInitialOrderMatterBlue);
        this.destroyGraph(this.isInitialOrderMatterAll);

        this.isInitialOrderMatterBlue = this.doesInitOrderMatter(this.deep(this.gData), 'blue', 'isInitialOrderMatterBlue');
        this.isInitialOrderMatterBlue.render();
      } break;

      case 2: {
        this.destroyGraph(this.isInitialOrderMatterWhite);
        this.destroyGraph(this.isInitialOrderMatterBlue);
        this.destroyGraph(this.isInitialOrderMatterAll);

        this.isInitialOrderMatterAll = this.doesInitOrderMatter(this.deep(this.gData), 'all', 'isInitialOrderMatterAll');
        this.isInitialOrderMatterAll.render();
      } break;
     default: {
      console.log($event);
    }
  }
}

  generatePdf() {
    let data = this.deep(this.gData);
    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    let aliData = data.filter(x => {
      return (x.dogName.toLowerCase() == 'ali')
    });

    let map = new Map();
    for(let i=0; i<aliData.length; i++) {
      if(map.has(aliData[i].date)) {
        let tmp = map.get(aliData[i].date);
        tmp.push(this.deep(aliData[i]));
        map.set(aliData[i].date, tmp);
      } else {
        let tmp = [];
        tmp.push(this.deep(aliData[i]));
        map.set(aliData[i].date, tmp);
      }
    }

    let bodyData = [[{text: 'Day', style: 'tableHeader', alignment: 'center'}, 
    {text: 'Chicken Bowl', style: 'tableHeader', alignment: 'center'}, 
    {text: 'Inital Order', style: 'tableHeader', alignment: 'center'},
    {text: '# Bowls Visited', style: 'tableHeader', alignment: 'center'},
    {text: 'Visited Order', style: 'tableHeader', alignment: 'center'},
    {text: 'Time', style: 'tableHeader', alignment: 'center'},
    {text: 'Comments', style: 'tableHeader', alignment: 'center'}]];

    let counter = 1;
    map.forEach((value, key) => {
      let row :any = [];

      let day: any = {};
      if(value.length > 0) {
        day.rowSpan = value.length;
        let date = new Date(key);
        day.text = "Day " + counter + ": " + date.getMonth() + "/" + date.getDay() + "/" + date.getFullYear();
        row.push(day);

        row.push(value[0].chickenBowl);
        row.push(this.bowlsToString(value[0].orderOfBowls));
        row.push(value[0].nBowlsVisited);
        row.push(this.bowlsToString(value[0].bowlsVisitedOrder));
        row.push(value[0].timeToChicken);
        
        if(value[0].comments.length > 0) {
          row.push(value[0].comments);
        } else {
          row.push("None");
        }

        bodyData.push(row);
        row = [];
      }

      for(let i=1; i<value.length; i++) {
        row = [];
        row.push(" ");
        row.push(value[i].chickenBowl);
        row.push(this.bowlsToString(value[i].orderOfBowls));
        row.push(value[i].nBowlsVisited);
        row.push(this.bowlsToString(value[i].bowlsVisitedOrder));
        row.push(value[i].timeToChicken);
        
        if(value[i].comments.length > 0) {
          row.push(value[i].comments);
        } else {
          row.push("None");
        }
        bodyData.push(row);
      }
      counter++;
    });


    var dd = {
      content: [
      {
        table: {
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          headerRows: 1,
          body: bodyData
        }
      }],
    };

    pdfMake.createPdf(dd).download();
  }

  destroyGraph(graphInstance) {
    if(graphInstance) graphInstance.destroy();
  }

  updateValue(event, cell, rowIndex) {
    console.log('inline editing rowIndex', rowIndex)
    this.editing[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];

    this._dataService.update(this.rows[rowIndex]).subscribe( (result) => {
      console.log(result);
      console.log('UPDATED!', this.rows[rowIndex][cell]);
    });

  }

}
