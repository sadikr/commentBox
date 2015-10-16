var CommentBox = React.createClass({

	getInitialState : function(){
		return {data:[]};
	},

	loadDataFromServer : function(){
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},

	handleCommentSubmit : function (comment) {
		// first add comments to the local copy and then make a request 
		// so that comment listing appears fast
		// although not good idea.
		this.setState({data: this.state.data.concat([comment])});
		// TODO : handle comment submit form
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			type: 'POST',
			data: comment,
			success: function(data) {
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},

	componentDidMount: function() {
		this.loadDataFromServer();
		window.setInterval(this.loadDataFromServer,this.props.pollInterval);
	},

	render : function(){
		return(
			<div className="commentBox">
				<h1>Comment</h1>
				<CommentList data={this.state.data}/>
				<CommentForm onCommentSubmit={this.handleCommentSubmit}/>
			</div>	
			);
	}
});


var CommentList = React.createClass({
	render : function(){
		var commentNodes = this.props.data.map(function(comment){
			return(
				<Comment author={comment.author}>{comment.text}</Comment>
				);
		});
		return(
			<div className="commentList">
				{commentNodes}
			</div>
			);
	}
});

var CommentForm = React.createClass({
	handleSubmit : function(e){
		e.preventDefault();
		var author = this.refs.author.value.trim();
		var text = this.refs.text.value.trim();
		
		if(!author || !text)
			return;

		this.props.onCommentSubmit({author:author, text:text});
		// clear the refs manually
		this.refs.author.value='';
		this.refs.text.value='';
		return;

	},
	render : function(){
		return(
			<form className="commentForm" onSubmit={this.handleSubmit}>
				<input type="text" placeholder="Your name" ref="author"/>
				<input type="text" placeholder="Your comment" ref="text"/>
				<input type="submit" placeholder="Submit" />
			</form>
			);
	}
});

var Comment = React.createClass({
	rawMarkup : function(){
		var rawMarkup = marked(this.props.children.toString(),{sanitize:true});
		return {__html : rawMarkup};
	},
	render: function() {
		return (
			<div className="comment">
				<h2 className="commentAuthor">{this.props.author}</h2>
				<span dangerouslySetInnerHTML={this.rawMarkup()} />
			</div>
		);
	}
});

var data = [
  {author: "Pete Hunt", text: "This is one comment"},
  {author: "Jordan Walke", text: "This is *another* comment"}
];

ReactDOM.render(
	<CommentBox url="/api/comments" pollInterval={2000}/>,
	document.body
	)