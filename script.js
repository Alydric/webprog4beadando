class List {
	constructor(){
		this.elements = [];
		this.size = 0;
	}
	
	addElement(elem){
		this.elements = [...this.elements, elem];
		this.size += 1;
	}
	
	getElement(index){
		if(index >= 0 && index < this.elements.length){
			return this.elements[index];
		}
		return null;
	}
	
	Size(){
		return this.size;
	}
}

class Article {
	constructor(recommendedLabels, recommendedOtherLabels, uniqueLabels, uniqueOtherLabels, title, text){
		this.recommendedLabels = recommendedLabels;
		this.recommendedOtherLabels = recommendedOtherLabels;
		this.uniqueLabels = uniqueLabels;
		this.uniqueOtherLabels = uniqueOtherLabels;
		this.title = title;
		this.text = text;
	}
	
}

var list = new List();
var articlesToShow = 20;
var currentPage = 1;
var pages = 0;
var currentArticle = 0;

function getLabel(labelLine){
	label = new Object();
	var splitted = labelLine.split(" ");
	label["text"] = splitted[0];
	if(splitted.length >= 2){
		if(splitted[1] === "1e-05"){
			splitted[1] = "0.00001";
		}
		label["probablity"] = splitted[1];
	}
	else{
		label["probablity"] = 1;
	}
	
	return label;
}

function getLabels(col){
	var returnValue = new Object();
	var labels = col.split("__label__").slice(1);
	labels.forEach(l => {
		var label = getLabel(l);
		returnValue[label["text"]] = label["probablity"];
	});
	return returnValue;
}

function parseData(data){
	var lines = data.split("\n");
	pages = lines.length/articlesToShow;
	
	lines.forEach(l => {
		var props = l.split("$$$");
		var recommendedLabels = getLabels(props[0]);
		var recommendedSpecialLabels = getLabels(props[1]);
		var recommendedOtherLabels = new Object();
		
		for (const [key, value] of Object.entries(recommendedSpecialLabels)) {
			if(key.startsWith("geography__") || key.startsWith("organization__") || key.startsWith("person__")){
				recommendedOtherLabels[key] = value;
			}
		}
		
		var uniqueLabels = getLabels(props[2]);
		var uniqueOtherLabels = new Object();
		
		for (const [key, value] of Object.entries(uniqueLabels)) {
			if(value.startsWith("geography__") || value.startsWith("organization__") || value.startsWith("person__")){
				uniqueOtherLabels[value] = value;
				delete uniqueLabels[key];
			}
		}
		
		var title = props[3];
		var text = props[4];
		
		var article = new Article(recommendedLabels, recommendedOtherLabels, uniqueLabels, uniqueOtherLabels, title, text);
		list.addElement(article);
	});
}

function fillSelect(){
	
	if(currentPage <= 0){
		currentPage = pages;
	}
	if(currentPage > pages){
		currentPage = 1;
	}
	
	var from = (currentPage-1) * articlesToShow;
	var to = from + articlesToShow;
	
	$("#select2").empty();
	for(var i = from; i < to; i++){
		var element = list.getElement(i);
		
		$("#select2").append(`<option value="${i}"> 
								${element.title} 
							 </option>`);
	}
	
	$("#select2 option").first().attr('selected', 'selected');
	currentArticle = (currentPage-1)*articlesToShow;
	updateContent(currentArticle);
}

function updateContent(index){
	var currentArticle = list.getElement(index);
		
	$("#text").text(currentArticle.text);
		
	var recommendedLabels = "";
	for (const [key, value] of Object.entries(currentArticle.recommendedLabels)) {
		recommendedLabels += key + " (" + value + ")<br/>";
	}
	$("#recommendedLabels").html(recommendedLabels);
		
	var recommendedOtherLabels = "";
	for (const [key, value] of Object.entries(currentArticle.recommendedOtherLabels)) {
		recommendedOtherLabels += key + " (" + value + ")<br/>";
	}
	$("#recommendedOtherLabels").html(recommendedOtherLabels);
		
	var uniqueLabels = "";
	for (const [key, value] of Object.entries(currentArticle.uniqueLabels)) {
		uniqueLabels += key + "<br/>";
	}
	$("#uniqueLabels").html(uniqueLabels);
		
	var uniqueOtherLabels = "";
	for (const [key, value] of Object.entries(currentArticle.uniqueOtherLabels)) {
		uniqueOtherLabels += value + "<br/>";
	}
	$("#uniqueOtherLabels").html(uniqueOtherLabels);
}

$(document).ready(function(){
	$.get('data.txt', function(data) {
		parseData(data);
		fillSelect();
	}, 'text');
	
	$("#prevPage").on('click', function(){
		currentPage--;
		fillSelect();
	});
	
	$("#prev").on('click', function(){
		var selected = $('#select2 option:selected');
		if(currentArticle - 1 < (currentPage-1) * articlesToShow){
			currentArticle = parseInt((currentPage-1) * articlesToShow + (articlesToShow - 1), 10);
			$('#select2 option:selected').last().attr('selected', 'selected');
			selected.removeAttr("selected");
		}
		else{
			currentArticle--;
			selected.prev().attr('selected', 'selected');
			selected.removeAttr("selected");
		}
		updateContent(currentArticle);
	});
	
	$("#next").on('click', function(){
		var selected = $('#select2 option:selected');
		if(currentArticle + 1 > (currentPage-1) * articlesToShow + articlesToShow - 1){
			currentArticle = parseInt((currentPage-1) * articlesToShow, 10);
			$('#select2 option:selected').first().attr('selected', 'selected');
			selected.removeAttr("selected");
		}
		else{
			currentArticle++;
			selected.next().attr('selected', 'selected');
			selected.removeAttr("selected");
		}
		updateContent(currentArticle);
	});
	$("#nextPage").on('click', function(){
		currentPage++;
		fillSelect();
	});
	
	$("#select2").change(function(){
		var selected = $('#select2 option:selected');
		currentArticle = parseInt((currentPage-1)*articlesToShow + selected.val());
		updateContent(currentArticle);
	});
});