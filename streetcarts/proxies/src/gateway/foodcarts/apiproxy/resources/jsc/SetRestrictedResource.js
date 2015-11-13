 try{
  context.setVariable('flow.resource.name','/'+
    context.getVariable('request.verb')+
    context.getVariable('proxy.basepath')+
    context.getVariable('proxy.pathsuffix')
);
}catch(e){
    throw 'Error in Javascript' + e;
}