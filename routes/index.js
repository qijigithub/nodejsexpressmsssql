var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/////////////////////////////////////
/* POST index page to json page(select/week). */

const sql = require('mssql');
const config = {
  user: ,
  password: ,
  server: ,
  database: ,
  connectionTimeout: 1000000,
  requestTimeout: 1000000
};
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL')
    return pool
  })
  .catch(err => console.log('Database Connection Failed! Bad Config: ', err))

module.exports = {
  sql, poolPromise
}
//srt1.js
router.post('/select/week', async (req, res) => {
  var subquery1 =


  var subquery2 =


  // about actual spend: CategoryName,CategoryName

  // var subquery3 = "select CategoryName,sum(AdSpend) as 'CategoryName,' from [BV_International].[dbo].[SKUCategory]"+
  // " right join [BV_International].[dbo].[CampignPerformanceConcrete]"+
  // " on ItemSKU = [Advertised SKU] and region = 'Amazon.com'"+
  // //" where AdDate between '2019-03-11' and '2019-03-17' group by CategoryName"
  // " where AdDate between @fromdate and @todate group by CategoryName"

  //google ads
  var subquery3 =



  //about ads, vendor vendor central first: Date,CategoryName,[Campaign Name],CPC, spend
  var subquery4 = 


  //about ads, vender express: Date,categoryname ,a.[Campaign Name], CPC, Spend
  var subquery5 = 


  try {
    firstDay = new Date(req.body.year, 0, 1).getDay();
    console.log(firstDay);
    var fromdate = new Date(new Date("Jan 01, " + req.body.year + " 01:00:00").getTime() - (3600000 * 24 * (firstDay - 1)) + 604800000 * (req.body.week - 1));
    //new Date('March 11, 2019'); //weektodate(req.body.year,req.body.week) 
    var todate = new Date(new Date("Jan 01, " + req.body.year + " 01:00:00").getTime() - (3600000 * 24 * (firstDay - 1)) + 604800000 * (req.body.week - 1) + 518400000);
    const pool = await poolPromise
    const result = await pool.request()
      // .input('date', sql.Int, req.body.date)
      .input('year', sql.Int, req.body.year)
      .input('week', sql.Int, req.body.week)
      .input('fromdate', sql.Date, fromdate)
      .input('todate', sql.Date, todate)
      .query(subquery1)
    const result2 = await pool.request()
      // .input('date', sql.Int, req.body.date)
      .input('year', sql.Int, req.body.year)
      .input('week', sql.Int, req.body.week)
      .input('fromdate', sql.Date, fromdate)
      .input('todate', sql.Date, todate)
      .query(subquery2)

    const result3 = await pool.request()
      .input('fromdate', sql.Date, fromdate)
      .input('todate', sql.Date, todate)
      .query(subquery3)

    const result4 = await pool.request()
      .input('fromdate', sql.Date, fromdate)
      .input('todate', sql.Date, todate)
      .query(subquery4)

    const result5 = await pool.request()
      .input('fromdate', sql.Date, fromdate)
      .input('todate', sql.Date, todate)
      .query(subquery5)



    let rows1 = result.recordset
    let rows2 = result2.recordset
    let rows3 = result3.recordset
    let rows4 = result4.recordset
    let rows5 = result5.recordset

     itemsum =result2.recordset
    //vendor central spend and vendor express
    //var newspend =[]
    /** 
     * ads are  from 3 part, vendor express and vendor central, other is seller ads
    */
    for (var i = 0; i < rows1.length; i++) {
      var sum = 0;
      for (var j = 0; j < rows4.length; j++) {
        if (rows1[i]['CategoryName'] == rows4[j]['CategoryName']) {
          sum += parseFloat(rows4[j]['Spend'])

        }
      }
      for (var k = 0; k < rows5.length; k++) {
        if (rows1[i]['CategoryName'] == rows5[k]['categoryname']) {
          sum += parseFloat(rows5[k]['Spend'])

        }
      }
      rows1[i]['AmazonSpend'] = sum + parseFloat(rows1[i]['AmazonSpend'])
      rows1[i]['AmazonSpend'] = rows1[i]['AmazonSpend'].toFixed(2)
      //newspend[i] = {CategoryName: rows3[i]['CategoryName'],AmazonSpend: sum};
      //console.log(rows1[i]['CategoryName']+"  "+"SPEND"+rows1[i]['AmazonSpend'])
    }
    ////////////////////////////////////////////////////////////////////////
    // total cost
    // var unitprofit={};
    //  for (var i = 0 ; i < rows2.length; i++) {
    //    unitprofit[i]={item_sku: rows2[i]['ITEM_SKU'],unit_profit:parseFloat(rows2[i]['UNIT_PRICE'])-parseFloat(rows2[i]['UNIT_PRICE']) * 0.15 - parseFloat(rows2[i]['FBAFee'])-parseFloat(rows2[i]['TotalCost'])}
    //    //console.log(parseFloat(rows2[i]['UNIT_PRICE'])-parseFloat(rows2[i]['UNIT_PRICE']) * 0.15- parseFloat(rows2[i]['FBAFee']));
    //   }
    //  console.log(JSON.stringify(unitprofit));

    // if  unit_price == null-> profit table no item-> because have -FBA or have -FBW
    //just for vendor
    for (var i = 0; i < rows2.length; i++) {
      if (rows2[i]['UNIT_PRICE'] == null || rows2[i]['UNIT_PRICE'] == 0) {
        for (var j = 0; j < rows2.length; j++) {
          if (rows2[i]['ITEM_SKU'] + '-FBA' == rows2[j]['ITEM_SKU'] && parseFloat(rows2[j]['Vendorprice']) != 0) {
            rows2[i]['UNIT_PRICE'] = parseFloat(rows2[j]['Vendorprice'])
            rows2[i]['unit_profit'] = parseFloat(rows2[j]['VendorProfit'])
          }
        }
      }
    }



    ///////////////////////////////////////////////////////////
    for (var i = 0; i < rows2.length; i++) {
      if (rows2[i]['unit_profit'] == parseFloat(rows2[i]['UNIT_PRICE'])) {
        rows2[i]['unit_profit'] = parseFloat(rows2[i]['unit_profit']) - parseFloat(rows2[i]['UNIT_PRICE']) * 0.15 - parseFloat(rows2[i]['FBAFee']) - parseFloat(rows2[i]['TotalCost']) - parseFloat(rows2[i]['ShipToFBA'])
        rows2[i]['unit_profit'] = rows2[i]['unit_profit'].toFixed(2)
        //rows2[i]['unit_profit']= parseFloat(rows2[i]['unit_profit'])-parseFloat(rows2[i]['TotalCost'])
        //console.log(rows2[i]['ITEM_SKU'] ,parseFloat(rows2[i]['unit_profit']),parseFloat(rows2[i]['UNIT_PRICE']) * 0.15,parseFloat(rows2[i]['FBAFee']),parseFloat(rows2[i]['TotalCost']) ,parseFloat(rows2[i]['ShipToFBA']));
        if (parseFloat(rows2[i]['FBAFee']) == 0 && parseFloat(rows2[i]['TotalCost']) == 0) {
          console.log(rows2[i]['ITEM_SKU'] + ' has 0, new item price should add')
        }
        if (parseFloat(rows2[i]['UNIT_PRICE']) == 0 || parseFloat(rows2[i]['UNIT_PRICE']) == null) {
          console.log(rows2[i]['ITEM_SKU'] + ' no unit price, maybe is vendorprice should add')
        }
      }
      if (rows2[i]['REVENUE'] != parseFloat(rows2[i]['WEEKLYQTY']) * parseFloat(rows2[i]['UNIT_PRICE'])) {
        rows2[i]['REVENUE'] = parseFloat(rows2[i]['WEEKLYQTY']) * parseFloat(rows2[i]['UNIT_PRICE'])
        //console.log( parseFloat(rows2[i]['WEEKLYQTY'])+"   "+parseFloat(rows2[i]['UNIT_PRICE']));
        rows2[i]['REVENUE'] = rows2[i]['REVENUE'].toFixed(2)
      }
    }


    // for calculate profit: if rows1.category =  rows2.item's category => weekylyQTY *  unit profit 
    var profit = [];
    console.log(fromdate + "  " + todate);
    for (var i = 0; i < rows1.length; i++) {
      var sum = 0;
      for (var j = 0; j < rows2.length; j++) {
        if (rows1[i]['CATEGORY'] == rows2[j]['CATEGORY']) {
          sum = sum + rows2[j]['WEEKLYQTY'] * rows2[j]['unit_profit']
          //console.log(sum);
        }
      }
      profit[i] = { CATEGORY: rows1[i]['CATEGORY'], PROFIT: sum.toFixed(2) }
    }



    // maping table googleads
    /**
     * 
     * google ads part:
     * googleads: table: category.item_sku,label,clicks,cost,campaign
     * gooeleadsitem: item,clicks,cost,label
     * googleadscate: item,clicks,cost,label
     * gadsum: category, cost
     * */


    /**  mapping google ads table with item_sku in rows2(result2)
    *  ads splits to google display and google search, item_sku is the changed name, campaign is the original name, category is the category name by mapping 
    * googleads item_sku contains 3 name formats, display+item_sku format, item_sku format and category format.
    * problem : maybe add item in future and maybe add key-value pairs in future 
    * */
    var googleads = []
    var gadsindex = 0;

    for (var j = 0; j < rows3.length; j++) {
      if (rows3[j]['Campaign'] == 'BV-CL-7FT') {
        googleads[gadsindex++] = { CATEGORY: 'FLEX CABLE', ITEM_SKU: 'BV-CL-7FT', LABEL: 'google search', CLICKS: rows3[j]['Clicks'], COST: rows3[j]['Cost'], CAMPAIGN: rows3[j]['Campaign'] }

      } else if (rows3[j]['Campaign'] == 'BV-CT-7FT') {
        googleads[gadsindex++] = { CATEGORY: 'FLEX CABLE', ITEM_SKU: 'BV-CT-7FT', LABEL: 'google search', CLICKS: rows3[j]['Clicks'], COST: rows3[j]['Cost'], CAMPAIGN: rows3[j]['Campaign'] }

      } else if (rows3[j]['Campaign'] == 'BV-RH-01') {
        googleads[gadsindex++] = { CATEGORY: 'RANGE HOOD', ITEM_SKU: 'BV-RH-01', LABEL: 'google search', CLICKS: rows3[j]['Clicks'], COST: rows3[j]['Cost'], CAMPAIGN: rows3[j]['Campaign'] }

      } else if (rows3[j]['Campaign'] == 'BV-RH-201') {
        googleads[gadsindex++] = { CATEGORY: 'RANGE HOOD', ITEM_SKU: 'BV-RH-201', LABEL: 'google search', CLICKS: rows3[j]['Clicks'], COST: rows3[j]['Cost'], CAMPAIGN: rows3[j]['Campaign'] }

      }
      else if (rows3[j]['Campaign'] == 'BV-RH-801') {
        googleads[gadsindex++] = { CATEGORY: 'RANGE HOOD', ITEM_SKU: 'BV-RH-801', LABEL: 'google search', CLICKS: rows3[j]['Clicks'], COST: rows3[j]['Cost'], CAMPAIGN: rows3[j]['Campaign'] }

      }
      else if (rows3[j]['Campaign'] == 'Search - Bathroom Fan') {
        googleads[gadsindex++] = { CATEGORY: 'BATHROOM FAN', ITEM_SKU: 'BATHROOM FAN', LABEL: 'google search', CLICKS: rows3[j]['Clicks'], COST: rows3[j]['Cost'], CAMPAIGN: rows3[j]['Campaign'] }

      }
      else if (rows3[j]['Campaign'] == 'Search - Security Cable') {
        googleads[gadsindex++] = { CATEGORY: 'FLEX CABLE', ITEM_SKU: 'FLEX CABLE', LABEL: 'google search', CLICKS: rows3[j]['Clicks'], COST: rows3[j]['Cost'], CAMPAIGN: rows3[j]['Campaign'] }

      }
      else if (rows3[j]['Campaign'] == 'Search - Tie Out Cable') {
        googleads[gadsindex++] = { CATEGORY: 'TIE-OUT', ITEM_SKU: 'TIE-OUT', LABEL: 'google search', CLICKS: rows3[j]['Clicks'], COST: rows3[j]['Cost'], CAMPAIGN: rows3[j]['Campaign'] }

      }
      else if (rows3[j]['Campaign'] == 'Display - BV-BF-01') {
        googleads[gadsindex++] = { CATEGORY: 'BATHROOM FAN', ITEM_SKU: 'BV-BF-01', LABEL: 'google display', CLICKS: rows3[j]['Clicks'], COST: rows3[j]['Cost'], CAMPAIGN: rows3[j]['Campaign'] }

      }
      else if (rows3[j]['Campaign'] == 'DIsplay - BV-PE-BR-2-IN-1') {
        googleads[gadsindex++] = { CATEGORY: 'GROOMING BRUSH', ITEM_SKU: 'BV-PE-BR-2-IN-1', LABEL: 'google display', CLICKS: rows3[j]['Clicks'], COST: rows3[j]['Cost'], CAMPAIGN: rows3[j]['Campaign'] }
        //console.log(googleads[gadsindex-1]);
      }
      else if (rows3[j]['Campaign'] == 'Display - BV-RH-01') {
        googleads[gadsindex++] = { CATEGORY: 'RANGE HOOD', ITEM_SKU: 'BV-RH-01', LABEL: 'google display', CLICKS: rows3[j]['Clicks'], COST: rows3[j]['Cost'], CAMPAIGN: rows3[j]['Campaign'] }

      }
      else if (rows3[j]['Campaign'] == 'Display - BV-RH-201') {
        googleads[gadsindex++] = { CATEGORY: 'RANGE HOOD', ITEM_SKU: 'BV-RH-201', LABEL: 'google display', CLICKS: rows3[j]['Clicks'], COST: rows3[j]['Cost'], CAMPAIGN: rows3[j]['Campaign'] }

      }
      else if (rows3[j]['Campaign'] == 'Display - BV-RH-801') {
        googleads[gadsindex++] = { CATEGORY: 'RANGE HOOD', ITEM_SKU: 'BV-RH-801', LABEL: 'google display', CLICKS: rows3[j]['Clicks'], COST: rows3[j]['Cost'], CAMPAIGN: rows3[j]['Campaign'] }

      }
      else if (rows3[j]['Campaign'] == 'Display - BV-RH-802') {
        googleads[gadsindex++] = { CATEGORY: 'RANGE HOOD', ITEM_SKU: 'BV-RH-802', LABEL: 'google display', CLICKS: rows3[j]['Clicks'], COST: rows3[j]['Cost'], CAMPAIGN: rows3[j]['Campaign'] }

      }
    }
    //console.log(JSON.stringify(googleads));
    //console.log(googleads.length);
    //console.log(JSON.stringify(googleads));

    // console.log(googleads[5]['ITEM_SKU']);
    //console.log(gadsindex);
    //console.log(JSON.stringify(rows2));

    /**
     *  googleadsitem (google ads items click and cost sum ) contain : 
     *    itmename: sum(click) group by item_sku, sum(cost) group by item_sku, item name maybe same and label but if item name is same, label should be different.
     *  for google search : if item name == item_sku || item_sku+ '-FBA' &&  not duplicate in name => add one line 
     *  for google display: if item name == item_sku || item_sku+ '-FBA' &&  not duplicate in name => add one line 
     *   */

    var googleadsitem = []
    var gindex = 0
    for (var i = 0; i < rows2.length; i++) {
      var sumclick = 0;
      var sumcost = 0;
      for (var j = 0; j < googleads.length; j++) {
        if (googleads[j]['LABEL'] == 'google search' && (rows2[i]['ITEM_SKU'] == googleads[j]['ITEM_SKU'] || rows2[i]['ITEM_SKU'] == googleads[j]['ITEM_SKU'] + '-FBA')) {
          sumclick = parseFloat(googleads[j]['CLICKS']) + sumclick;
          sumcost = parseFloat(googleads[j]['COST']) + sumcost;
        }
      }
      if (sumclick == 0) {
        sumclick = 1;
      }
      var AvgCPC = sumcost / sumclick
      if (i != 0 && rows2[i]['ITEM_SKU'] != rows2[i - 1]['ITEM_SKU'] || i == 0) {
        googleadsitem[gindex++] = { category: rows2[i]['CATEGORY'], item: rows2[i]['ITEM_SKU'], clicks: sumclick, cost: sumcost.toFixed(2), avgcpc: AvgCPC.toFixed(2), label: 'google search' }
      }
    }

    for (var i = 0; i < rows2.length; i++) {
      var sumclick = 0;
      var sumcost = 0;
      for (var j = 0; j < googleads.length; j++) {
        if (googleads[j]['LABEL'] == 'google display' && (rows2[i]['ITEM_SKU'] == googleads[j]['ITEM_SKU'] || rows2[i]['ITEM_SKU'] == googleads[j]['ITEM_SKU'] + '-FBA')) {
          sumclick = parseFloat(googleads[j]['CLICKS']) + sumclick;
          sumcost = parseFloat(googleads[j]['COST']) + sumcost;
        }
      }
      if (sumclick == 0) {
        sumclick = 1;
      }
      var AvgCPC = sumcost / sumclick
      if (i != 0 && rows2[i]['ITEM_SKU'] != rows2[i - 1]['ITEM_SKU'] || i == 0) {
        googleadsitem[gindex++] = { category: rows2[i]['CATEGORY'], item: rows2[i]['ITEM_SKU'], clicks: sumclick, cost: sumcost.toFixed(2), avgcpc: AvgCPC.toFixed(2), label: 'google display' }
      }
    }
    /**
     * googleadscate: (google category click and cost sum): it category == g.item => add line
     */
    googleadscate = []
    var gadscindex = 0;

    for (var i = 0; i < rows1.length; i++) {
      var sumclick = 0;
      var sumcost = 0;
      for (var j = 0; j < googleads.length; j++) {
        if (rows1[i]['CATEGORY'] == googleads[j]['ITEM_SKU']) {
          sumclick = parseFloat(googleads[j]['CLICKS']) + sumclick;
          sumcost = parseFloat(googleads[j]['COST']) + sumcost;
        }
      }
      if (sumclick == 0) {
        sumclick = 1;
      }
      var AvgCPC = sumcost / sumclick
      googleadscate[gadscindex++] = { category: rows1[i]['CATEGORY'], item: rows1[i]['CATEGORY'], clicks: sumclick, cost: sumcost.toFixed(2), avgcpc: AvgCPC.toFixed(2), label: 'google search' }
    }


    /**
     * google ads cost sum by category = googleads sum by category
     * (1) google item(category) ads cost sum :
     */
    gadsum = []
    for (var i = 0; i < rows1.length; i++) {
      var sumcost = 0;
      for (var j = 0; j < googleads.length; j++) {
        if (rows1[i]['CATEGORY'] == googleads[j]['CATEGORY']) {
          sumcost = parseFloat(googleads[j]['COST']) + sumcost;
        }
      }
      gadsum[i] = { category: rows1[i]['CATEGORY'], cost: sumcost }
    }
    //console.log("gadsum :  "+JSON.stringify(gadsum));
    /**
     * amazon ads summary:
     * amazonselleradsitem
     * amazon ads:
     *  amazon seller:
     *    ads(rows2)add to jade
     *  amazon vendor:
     *    vendor spnosor 
     *    vendor display
     *    vendor banner
     */
    //amazon seller
    var aselleradsitem = [];
    var asellindex = 0;
    for (var i = 0; i < rows2.length; i++) {
      if (i != 0 && rows2[i]['ITEM_SKU'] != rows2[i - 1]['ITEM_SKU'] || i == 0) {
        aselleradsitem[asellindex++] = { category: rows2[i]['CATEGORY'], item: rows2[i]['ITEM_SKU'], clicks: '0', cost: rows2[i]['ads'].toFixed(2), avgcpc: '0', label: 'amaozn seller' }
      }
    }
    // console.log("aselleradsitem  :  "+JSON.stringify(aselleradsitem));

    /** 
     * amazon ads summary
     */
    // amazon vendor: 
    // avendor banner:
    // for (var i = 0; i < rows5.length; i++) {
    //   //if (rows5[i]['categroyname'] == )
    // }
    // avendor sponsor:
    // avendor display


    /**
     * actual spend: sum by category
     * google ads sum + amazon seller ads sum + amazon vendor ads sum 
     * [gadsum] + [asellersum] + [avendorsum] by category
     */
    adssum = []
    for (var i = 0; i < rows1.length; i++) {
      var sumspend = 0
      // vendor sponsor
      for (var j = 0; j < rows4.length; j++) {
        if (rows1[i]['CATEGORY'] == rows4[j]['CategoryName']) {
          sumspend += parseFloat(rows4[j]['Spend'])
        }
      }
      // vendor banner
      for (var k = 0; k < rows5.length; k++) {
        if (rows1[i]['CATEGORY'] == rows5[k]['categoryname']) {
          sumspend += parseFloat(rows5[k]['Spend'])
        }
      }
      //vendor seller ::: bug  aselleradsitem less
      sumspend += parseFloat(rows1[i]['AmazonSpend'])

      //vendor display
      // google ads
      for (var m = 0; m < gadsum.length; m++) {
        if (rows1[i]['CATEGORY'] == gadsum[m]['category']) {
          sumspend += parseFloat(gadsum[m]['cost'])
        }
      }
      adssum[i] = { category: rows1[i]['CATEGORY'], cost: sumspend.toFixed(2) }
    }

    //console.log(JSON.stringify(googleadsitem));

    // console.log(JSON.stringify(margin));
    // console.log(JSON.stringify(result.recordset));
    // console.log(JSON.stringify(result2.recordset));
    /**
* for budget: get input and then save in json file
// */
//     tbudget = []
//     for (var i = 0; i < rows1.length; i++) {
//       tbudget[i] = { category: rows1[i]['CATEGORY'], budget: 0 }
//     }
    // for (var i = 0; i< tbudget.length; i++) {
    //   console.log("inside", req.body.budget[i]['budget']);
    // }
    //console.log(req.body.budget);
    //console.log(JSON.stringify(tbudget));



    //for calculate margin: if rows1.category == profit.category == actualspend.category => unit_margin= (profit - spend)/cateQTY, margin= profit -spend
    var margin = {};
    for (var i = 0; i < adssum.length; i++) {
      var qty = 0
      for (var k = 0; k < rows1.length; k++) {
        if (adssum[i]['category'] == rows1[k]['CATEGORY']) {
          qty = rows1[k]['categoryqty']
        }
      }
      for (var j = 0; j < profit.length; j++) {
        if (adssum[i]['category'] == profit[j]['CATEGORY']) {
          margin[i] = { CATEGORY: adssum[i]['category'], Unit_Margin: ((profit[j]['PROFIT'] - adssum[i]['cost']) / qty).toFixed(2), Margin: (profit[j]['PROFIT'] - adssum[i]['cost']).toFixed(2) }
        }
      }
    }

    res.render('json', {
      title2: ' Weekly Sales Report -BVI ', year: req.body.year, week: req.body.week, fromdate: fromdate, todate: todate, profit: profit, data: result.recordset, data2: result2.recordset,
      margin: margin, googleadsitem: googleadsitem, googleadscate: googleadscate, aselleradsitem: aselleradsitem, adssum: adssum, 
    });

  } catch (err) {
    //res.status(500)
    res.send(err.message)
  }
})
  
/////////////////////////////////////


module.exports = router;
  
