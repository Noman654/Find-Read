$(document).ready(function() {
  var item, tile, author, publisher, bookLink, bookImg;
  var outputList = document.getElementById("list-output");
  var bookUrl = "https://www.googleapis.com/books/v1/volumes?q=";
  var apiKey = "key=AIzaSyDtXC7kb6a7xKJdm_Le6_BYoY5biz6s8Lw";
  var placeHldr = '<img src="https://via.placeholder.com/150">';
  var searchData;
// auto complete 
        $("#search-box").keyup(function(){
          document.getElementById("content").innerHTML =""
          var search = $(this).val();
          //handling empty search-box input field
         if(search != "") {
          // console.log(search);
          // $.get("https://www.googleapis.com/books/v1/volumes?q="+search, getBookData()});
          $.ajax({
             url: bookUrl + search,
             dataType: "json",
             success: function(response) {
               console.log(response)
               if (response.totalItems === 0) {
                 alert("no result!.. try again")
               }
               else {
                 displayResultsAuto(response);
               }
             }
           });
         }
         else{
          document.getElementById("content").innerHTML =""
         }
      });

      $(document).on('click','a',function(){
        $("#search-box").val($(this).text().trim());
        document.getElementById("content").innerHTML =""
      });
      
      // display search-box element --

      function displayResultsAuto(response) {
        for (var i = 0; i < response.items.length; i++) {
          var item = response.items[i];
          // in production code, item.text should have the HTML entities escaped.
          document.getElementById("content").innerHTML += `<a class="list-group-item list-group-item-action boarder-2 bg-secondary text-white form-control" style="width:86%; height:auto;">
          ${item.volumeInfo.title}</a>`;
  
        }
        console.log(response.items)
      }
// auto complete end 

  //listener for search button
  $("#search").click(function() {
    outputList.innerHTML = ""; //empty html output
    document.body.style.backgroundImage = "url('')";
     searchData = $("#search-box").val();
     //handling empty search input field
     if(searchData === "" || searchData === null) {
       displayError();
     }
    else {
       // console.log(searchData);
       // $.get("https://www.googleapis.com/books/v1/volumes?q="+searchData, getBookData()});
       $.ajax({
          url: bookUrl + searchData,
          dataType: "json",
          success: function(response) {
            console.log(response)
            if (response.totalItems === 0) {
              alert("no result!.. try again")
            }
            else {
              $("#title").animate({'margin-top': '5px'}, 1000); //search box animation
              $(".book-list").css("visibility", "visible");
              displayResults(response);
            }
          },
          error: function () {
            alert("Something went wrong.. <br>"+"Try again!");
          }
        });
      }
      $("#search-box").val(""); //clearn search box
   });

   /*
   * function to display result in index.html
   * @param response
   */
   function displayResults(response) {
      for (var i = 0; i < response.items.length; i+=2) {
        item = response.items[i];
        title1 = item.volumeInfo.title;
        author1 = item.volumeInfo.authors;
        publisher1 = item.volumeInfo.publisher;
        bookLink1 = item.volumeInfo.previewLink;
        bookIsbn = item.id
        bookImg1 = (item.volumeInfo.imageLinks) ? item.volumeInfo.imageLinks.thumbnail : placeHldr ;
        bookrating1 = item.volumeInfo.averageRating;

        item2 = response.items[i+1];
        title2 = item2.volumeInfo.title;
        author2 = item2.volumeInfo.authors;
        publisher2 = item2.volumeInfo.publisher;
        bookLink2 = item2.volumeInfo.previewLink;
        bookrating2 = item2.volumeInfo.averageRating;
        // google id 
        bookIsbn2 =item2.id
        bookImg2 = (item2.volumeInfo.imageLinks) ? item2.volumeInfo.imageLinks.thumbnail : placeHldr ;

        // in production code, item.text should have the HTML entities escaped.
        outputList.innerHTML += '<div class="row mt-4">' +
                                formatOutput(bookImg1, title1, author1, publisher1, bookLink1, bookIsbn, bookrating1) +
                                formatOutput(bookImg2, title2, author2, publisher2, bookLink2, bookIsbn2, bookrating2) +
                                '</div>';

        console.log(outputList);
      }
   }

   /*
   * card element formatter using es6 backticks and templates (indivial card)
   * @param bookImg title author publisher bookLink
   * @return htmlCard
   */
   function formatOutput(bookImg, title, author, publisher, bookLink, bookIsbn,bookrating) {
     // console.log(title + ""+ author +" "+ publisher +" "+ bookLink+" "+ bookImg)
     var viewUrl = 'read/'+bookIsbn; //constructing link for bookviewer
     var htmlCard = `<div class="col-lg-6">
       <div class="card" style="">
         <div class="row no-gutters">
           <div class="col-md-4">
             <img src="${bookImg}" class="card-img" alt="...">
           </div>
           <div class="col-md-8">
             <div class="card-body">
               <h5 class="card-title">${title}</h5>
               <p class="card-text">Author: ${author}</p>
               <p class="card-text">Publisher: ${publisher}</p>
               rating
               <p style="margin-right:0%; ;">  ${star(bookrating)}  (${bookrating})</p>
               <a target="_blank" href="${viewUrl}" class="btn btn-secondary">Read Book</a>
               <a target="_blank" href="${viewUrl}" class="btn btn-secondary" style="margin-left:20%;margin-botttom:0%">BUY BOOK</a>
             </div>
           </div>
         </div>
       </div>
     </div>`
     return htmlCard;
   }

   /* give me star */
   function star(rating){
    var htmlstar=''
    for(var i =1;i<=5;i++)
     {
       if(rating>=i)
         htmlstar+='<i class="fa fa-star"></i>';
       else if(rating+0.5==i)
       {
          htmlstar+='<i class="fa fa-star-half-o"></i>';
       }
       else 
          htmlstar+='<i class="fa fa-star-o"></i>';

     }
    return htmlstar;
   }
   //handling error for empty search box
   function displayError() {
     alert("search term can not be empty!")
   }

});
