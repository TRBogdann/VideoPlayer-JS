
function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius);
    ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    ctx.arcTo(x + width, y, x + width - radius, y, radius);
    ctx.arcTo(x, y, x, y + radius, radius);
    ctx.fill();
  }

function rotateAround(x,y,angle,originX=0,originY=0)
{
    x = x-originX;
    y = y-originY;

    rad = (angle*Math.PI)/180;
    x = Math.cos(rad)*x-Math.sin(rad)*y;
    y = Math.cos(rad)*y+Math.sin(rad)*x;

    return [x+originX,y+originY];
}

function shuffle(array) {
    let currentIndex = array.length;
  
    while (currentIndex != 0) {

      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  }

  function heat(value) {
    const growth = 255 / 4;
    const normalized = value / growth; 
    let r = 0, g = 0, b = 0;

    if (normalized < 1) {
        b = 255;
        g = Math.round(255 * normalized);
    } else if (normalized < 2) {
        b = 255 - Math.round(255 * (normalized - 1));
        g = 255;
    } else if (normalized < 3) {
        g = 255;
        r = Math.round(255 * (normalized - 2));
    } else {
        g = 255 - Math.round(255 * (normalized - 3));
        r = 255;
    }

    return [r, g, b];
}

function linearIndex(i,j,width,height)
{
    return i*width+j;
}

function applyEffect(image,effect)
{
    switch(effect)
    {
        
        case 'heatmap':{
            const data = image.data;
            const mat = [];
            for(let i=0; i<data.length; i+=4)
            {
                let s = 0.299*data[i] + 0.587*data[i+1] + 0.114*data[i+2]; 
                let vec = heat(s);
                data[i] = vec[0];
                data[i+1] = vec[1];
                data[i+2] = vec[2];
            };


        }
            break;

        case 'greyscale':{
            const data = image.data;

            for(let i=0; i<data.length; i+=4)
            {
                let s = 0.299*data[i] + 0.587*data[i+1] + 0.114*data[i+2];
                data[i]=data[i+1]=data[i+2]=Math.round(s);
            };
        }
        break;

        //Inpiratie 3blue1brown
        //Nota catre sine: kernel utilizat pentru copnvolutie
        //   b  null r
        // 0.25  0  -0.25
        // 0.5   0  -0.5
        // 0.25  0  -0.25 
        case '3D':
        {
            const data = image.data;

            let vec = [];
            
            for(let i=4;i<image.height*4-4;i+=4)
                for(let j=4;j<image.width*4-4;j+=4)
            {
                let indexes = [
                    linearIndex(i-4,j-4,image.width),linearIndex(i-4,j+4,image.width),
                    linearIndex(i,j-4,image.width),linearIndex(i,j+4,image.width),
                    linearIndex(i+4,j-4,image.width),linearIndex(i+4,j+4,image.width)
                ]

                let strenght = [
                    0.25,-0.25,
                    0.5,-0.5,
                    0.25,-0.25
                ]
                let s = 0;
                for(let k=0;k<6;k++)
                {
                    s += strenght[k]*(0.299*data[indexes[k]] + 0.587*data[indexes[k]+1] + 0.114*data[indexes[k]+2]);
                }
                vec.push(s);
            }
            let pos = 0;
            
            for(let i=0;i<image.height*4;i+=4)
                for(let j=0;j<image.width*4;j+=4)
            {
                const index = linearIndex(i,j,image.width);
                if(i==0 || j==0 || i==image.height*4-4 || j==image.width*4-4)
                {
                    data[index] = 0;
                    data[index+1] = 0;
                    data[index+2] = 0
                }
                
                else {
                if(vec[pos]<0){
                    data[index] = -vec[pos];
                    data[index+1] = 0;
                    data[index+2] = 0
                }
                else
                {
                    data[index] = 0;
                    data[index+1] = 0;
                    data[index+2] = vec[pos];
                }
                pos++;
            }
            }

        }
        break;

        case 'emboss':
        {
            const data = image.data;

            let vec = [];
            
            for(let i=4;i<image.height*4-4;i+=4)
                for(let j=4;j<image.width*4-4;j+=4)
            {
                let indexes = [
                    linearIndex(i-4,j-4,image.width),linearIndex(i-4,j,image.width),
                    linearIndex(i,j-4,image.width),linearIndex(i,j,image.width),linearIndex(i,j+4,image.width),
                    linearIndex(i+4,j,image.width),linearIndex(i+4,j+4,image.width)
                ]

                let strenght = [
                    -2,-1,
                    -1,1,1,
                     1,2
                ]
                let r=0,b=0;g=0;
                for(let k=0;k<7;k++)
                {
                    r += strenght[k]*data[indexes[k]];
                    g += strenght[k]*data[indexes[k]+1];
                    b += strenght[k]*data[indexes[k]+2];
                }
                vec.push(r);
                vec.push(g);
                vec.push(b);
            }

            pos = 0;
            for(let i=0;i<image.height*4;i+=4)
                for(let j=0;j<image.width*4;j+=4)
            {
                const index = linearIndex(i,j,image.width);
                if(i==0 || j==0 || i==image.height*4-4 || j==image.width*4-4)
                {
                    data[index] = 0;
                    data[index+1] = 0;
                    data[index+2] = 0
                }

                else{
                let index = linearIndex(i,j,image.width)
                data[index] = vec[pos]
                data[index+1] = vec[pos+1]
                data[index+2] = vec[pos+2]
                pos+=3;
                }
            }
        
        }
        break;

            case 'gaussianBlur':
                {
                    const data = image.data;
        
                    let vec = [];
                    
                    for(let i=4;i<image.height*4-4;i+=4)
                        for(let j=4;j<image.width*4-4;j+=4)
                    {
                        let indexes = [
                            linearIndex(i-4,j-4,image.width),linearIndex(i-4,j,image.width),linearIndex(i-4,j+4,image.width),
                            linearIndex(i,j-4,image.width),linearIndex(i,j,image.width),linearIndex(i,j+4,image.width),
                            linearIndex(i+4,j,image.width),linearIndex(i+4,j,image.width),linearIndex(i+4,j+4,image.width)
                        ]
        

                        let strenght = [
                            0.0625 ,0.125, 0.0625 ,
                            0.125,0.25,0.125,
                            0.0625 ,0.125, 0.0625 
                        ]
                        let r=0,b=0;g=0;
                        for(let k=0;k<9;k++)
                        {
                            r += strenght[k]*data[indexes[k]];
                            g += strenght[k]*data[indexes[k]+1];
                            b += strenght[k]*data[indexes[k]+2];
                        }
                        data[indexes[5]] = r;
                        data[indexes[5]+1] = g;
                        data[indexes[5]+2] = b;
                    }
                
                }
                break;
    
         case 'edgeDetection':
                    {
                        const data = image.data;
            
                        let vec = [];
                        
                        for(let i=4;i<image.height*4-4;i+=4)
                            for(let j=4;j<image.width*4-4;j+=4)
                        {
                            let indexes = [
                                linearIndex(i-4,j-4,image.width),linearIndex(i-4,j,image.width),linearIndex(i-4,j+4,image.width),
                                linearIndex(i,j-4,image.width),linearIndex(i,j,image.width),linearIndex(i,j+4,image.width),
                                linearIndex(i+4,j,image.width),linearIndex(i+4,j,image.width),linearIndex(i+4,j+4,image.width)
                            ]
            
                            let strenght = [
                                0,1,0,
                                1,-4,1,
                                0,1,0
                            ]
    
                            let r=0,b=0;g=0;
                            for(let k=0;k<9;k++)
                            {
                                r += strenght[k]*data[indexes[k]];
                                g += strenght[k]*data[indexes[k]+1];
                                b += strenght[k]*data[indexes[k]+2];
                            }
                            vec.push(r)
                            vec.push(g)
                            vec.push(b)
                        }
    
                        pos = 0;
                        for(let i=0;i<image.height*4;i+=4)
                            for(let j=0;j<image.width*4;j+=4)
                        {
                            const index = linearIndex(i,j,image.width);
                            if(i==0 || j==0 || i==image.height*4-4 || j==image.width*4-4)
                            {
                                data[index] = 0;
                                data[index+1] = 0;
                                data[index+2] = 0
                            }

                            else{
                            let index = linearIndex(i,j,image.width)
                            data[index] = vec[pos]
                            data[index+1] = vec[pos+1]
                            data[index+2] = vec[pos+2]
                            pos+=3;
                            }
                        }
                    
                    }
    
    
                    break;

        case 'threshold':{
            let th = 255/2;
            const data = image.data;
    
            for(let i=0; i<data.length; i+=4)
            {
                let s = 0.2126*data[i] + 0.7152*data[i+1] + 0.0722*data[i+2];
                data[i]=data[i+1]=data[i+2]= s<th? 0:255;
            };

        }
            break;
        
        case 'invert':
        {
            const data = image.data;

            for(let i=0; i<data.length; i+=4)
            {
               data[i] = 255 - data[i];
               data[i+1] = 255 - data[i+1];
               data[i+2] = 255 - data[i+2];
            };
        }
            break;
        
        case 'sepia':
        {
            const data = image.data;


            for(let i=0; i<data.length; i+=4)
            {
                let r = data[i];
                let g = data[i+1];
                let b  = data[i+2];
    
                data[i]=(r *0.393) + (g *0.769) + (b *0.189);
                data[i+1]=(r *0.349) + (g *0.686) + (b *0.168)
                data[i+2]=(r *0.272) + (g *0.534) + (b *0.131)
            };
    
        }
            break;

        case 'noise':
            {
                const data = image.data;
        
        
                for(let i=0; i<data.length; i+=4)
                {
                    let posArr = [0,1,2]
                    shuffle(posArr);
                    data[i] = data[i+posArr[0]];
                    data[i+1] = data[i+posArr[1]];
                    data[i+2] = data[i+posArr[2]];
                };
            }  

            break;

        case 'iDontKnow':
        {
            const data = image.data;


            for(let i=0; i<data.length; i+=4)
            {
                let r = data[i];
                let g = data[i+1];
                let b  = data[i+2];
    
                let mx = r
                if(mx<g)
                    mx = g;
                if(mx<b)
                    mx = b;
                
                let dif = 0.9*(255-mx);
                data[i] = data[i] + dif;
                data[i+1] = data[i+1] + dif;
                data[i+2] = data[i+2] + dif;
            };
        }

            break;
        default:
    }
}
 const arrowObj = "-0.3333333333333333 -0.3333333333333333 0.6094757082487301 -1 0.7980375165651428 -0.9447715250169206 -0.14477152501692064 -0.278104858350254 -0.14477152501692064 -0.3885618083164127 0.7980375165651428 0.278104858350254 0.6094757082487301 0.3333333333333333 -0.3333333333333333 -0.3333333333333333";

  
  class Vec2
  {
      constructor(x,y) {
          this.x = x;
          this.y = y;
      }
  }
  
  class Quad
  {
      /**
       * 
       * @param {Array<Vec2>} vec 
       * @param {Vec2} position
       */
      constructor(vec,position,size)
      {
          this.#vec = vec;
          for(let i = 0; i<vec.length; i++)
          {
              this.#vec[i].x = (this.#vec[i].x*size)+position.x;
              this.#vec[i].y = (this.#vec[i].y*size)+position.y;
          }
          
      }
  
      draw(ctx)
      {
          ctx.beginPath()
          ctx.moveTo(this.#vec[0].x,this.#vec[0].y);
          ctx.lineTo(this.#vec[1].x,this.#vec[1].y);
          ctx.lineTo(this.#vec[2].x,this.#vec[2].y);
          ctx.lineTo(this.#vec[3].x,this.#vec[3].y);
          ctx.fill();
      }
  
      getVec()
      {
          return this.#vec;
      }
      
      #vec
  }
  
  class Arrow
  {
      /**
       * 
       * @param {string} objStr 
       * @param {Vec2} position 
       * @param {Number} size 
       */
      constructor(objStr,position,size)
      {
          const nums = objStr.split(" ").map(Number);
          const vec1 = []
          const vec2 = []
          for(let i = 0; i<nums.length/2; i+=2)
          {
              vec1.push(new Vec2(nums[i],nums[i+1]));
          }
  
          for(let i = nums.length/2; i<nums.length; i+=2)
          {
              vec2.push(new Vec2(nums[i],nums[i+1]));
          }
  
          this.#quad1 = new Quad(vec1,position,size);
          this.#quad2 = new Quad(vec2,position,size);

          this.#x = position.x;
          this.#y = position.y;
          this.#size = size;
      }
  
      getOrigin()
      {
          let x = 0;
          let y = 0;
          const vec1 = this.#quad1.getVec();
          const vec2 = this.#quad2.getVec();
  
          for(let i=0; i<vec1.length; i++)
          {
              x+=vec1[i].x;
              y+=vec1[i].y;
              x+=vec2[i].x;
              y+=vec2[i].y;
          }
  
          return new Vec2(x/8,y/8); 
      }
  
      rotate(angle)
      {
          const origin = this.getOrigin();
          const vec1 = this.#quad1.getVec();
          const vec2 = this.#quad2.getVec();
  
          for(let i=0; i<vec1.length;i++)
          {
              const temp1 = rotateAround(vec1[i].x,vec1[i].y,angle,origin.x,origin.y); 
              const temp2 = rotateAround(vec2[i].x,vec2[i].y,angle,origin.x,origin.y)
              vec1[i].x = temp1[0];
              vec1[i].y = temp1[1];
              vec2[i].x = temp2[0];
              vec2[i].y = temp2[1];
          }
  
      }
  
      draw(ctx,index,len,side)
      {
          let keep = ctx.fillStyle
          if((index==0 && side==0)
           ||(index==len-1 && side==1 ))
          {
            ctx.fillStyle = "grey";
          }
          this.#quad1.draw(ctx);
          this.#quad2.draw(ctx);
          ctx.fillStyle = keep;
      }

      intersects(x,y)
      {
        let newX = this.#x-this.#size/2;
        let newY = this.#y-this.#size;
        let newL = this.#size*1.3;
        return newX<=x && x<=newX+newL
        && newY<=y && y<=newY+newL;
      }

      #quad1
      #quad2
      #x
      #y
      #size
  }
  
class Timer
{
    constructor(x,y,width,num)
    {
        this.#x = x;
        this.#y = y;
        this.#width = width;
        this.#num = num;
    }

    draw(ctx,currentTime,duration)
    {
        let mySize = String(Math.floor(duration/60)).length;
        let time = "";
        let minute = String(Math.floor(Math.floor(currentTime)/60));
        let seconds = String(Math.floor(currentTime)%60);
        while(minute.length<mySize)
        {
            minute = "0"+minute;
        }
        if(seconds.length!=2)
            seconds = "0"+seconds;
    
        time = minute+":"+seconds;
    
        ctx.font = this.#num+"px serif";
        ctx.fillText(time,this.#x,this.#y-this.#num/4);
    
        let durationStr = String(Math.floor(Math.floor(duration)/60))+":";
        let durationSeconds = String(Math.floor(duration)%60);
        if(durationSeconds.length<2)
            durationStr+="0";
        durationStr+=durationSeconds;
        ctx.fillText(durationStr,this.#x+this.#width-this.#num*durationStr.length/2,this.#y-this.#num/4);    
    }

    #x
    #y
    #width
    #num
}

class PlayButton
{
    constructor(x,y,size)
    {
        this.#size = size;
        this.#x = x-size/2;
        this.#y = y-size/2;
    }

    /**
     * 
     * @param {RenderingContext} ctx 
     */
    #drawPlaying(ctx)
    {
        roundedRect(ctx,this.#x,this.#y,this.#size/3,this.#size,this.#size/10);
        roundedRect(ctx,this.#x+this.#size/2,this.#y,this.#size/3,this.#size,this.#size/10);
    }

    /**
     * 
     * @param {RenderingContext} ctx 
     */
    #drawPaused(ctx)
    { 
        ctx.beginPath()
        ctx.moveTo(this.#x, this.#y);
        ctx.lineTo(this.#x, this.#y+this.#size);
        ctx.lineTo(this.#x+this.#size,this.#y+this.#size/2);
        ctx.fill();
    }

    /**
     * 
     * @param {RenderingContext} ctx 
     * @param {Number} state 
     */
    draw(ctx,state)
    {
        if(state)
        {
            this.#drawPlaying(ctx);
            return;
        }

        this.#drawPaused(ctx);
    }

    chsangeSise(size)
    {
        this.#size = size;
    }

    intersects(x,y)
    {
        return this.#x<=x && x<=this.#x+this.#size
            && this.#y<=y && y<=this.#y+this.#size;
    }

    #x
    #y
    #size
}

class ControlBar
{
    constructor(x,y,width,height)
    {
        this.#width = width;
        this.#height = height;
        this.#x = x;
        this.#y = y;
    }

    draw(ctx)
    {
        roundedRect(ctx,this.#x,this.#y,this.#width,this.#height,12);
    }

    intersects(x,y)
    {
        return this.#x<=x && x<=this.#x+this.#width
            && this.#y<=y && y<=this.#y+this.#height;
    }

    #x
    #y
    #width;
    #height;
}

class LoadingBar
{
    constructor(x,y,width,height)
    {
        this.#x = x;
        this.#y = y;
        this.#width = width;
        this.#height = height;
    }

    draw(ctx,currentTime,duration,col)
    {
        roundedRect(ctx,this.#x,this.#y,this.#width,this.#height,4);
        
        let load = currentTime/duration;
        if(load!=0)
        {
            let keep = ctx.fillStyle;
            ctx.fillStyle = col;
            roundedRect(ctx,this.#x,this.#y,load*this.#width,this.#height,4)
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(this.#x+load*this.#width,this.#y+this.#height/2,this.#height,0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = keep;
        }

        
    }

    intersects(x,y)
    {
        return this.#x<=x && x<=this.#x+this.#width
            && this.#y-this.#height<=y && y<=this.#y+this.#height+this.#height;
    }

    #x
    #y
    #width
    #height;
}

class VolumeButton
{
    constructor(x,y,size)
    {
        this.#x = x;
        this.#y = y;
        this.#size = size;
    }

    draw(ctx,volume)
    {
        let recW = 0.375*this.#size;
        ctx.beginPath();
        ctx.moveTo(this.#x,this.#y);
        ctx.lineTo(this.#x+recW, this.#y);
        ctx.lineTo(this.#x+recW, this.#y+this.#size); 
        ctx.lineTo(this.#x, this.#y+this.#size); 
        ctx.fill();

        //x+recW 50
        //y 80  
        // 60 140 - 80 -2*l
        // 80 120 - 40 -l
        // 70 50 - 20  -l/2
        ctx.beginPath();
        ctx.moveTo(this.#x+recW , this.#y);
        ctx.lineTo(this.#x+recW+this.#size/2, this.#y-this.#size/2);
        ctx.lineTo(this.#x+recW+this.#size/2, this.#y-this.#size/2+2*this.#size); 
        ctx.lineTo(this.#x+recW , this.#y+this.#size); 
        ctx.fill();

        ctx.lineWidth = this.#size/10;
        let growth = recW/1.09;

        if(volume>0.1){
        ctx.beginPath();
        ctx.arc(this.#x+2*recW,this.#y+(this.#size)/2, growth, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
        }

        if(volume>0.4){
        ctx.beginPath();
        ctx.arc(this.#x+2*recW, this.#y+(this.#size)/2,2*growth, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
        }

        if(volume>0.7){
        ctx.beginPath();
        ctx.arc(this.#x+2*recW, this.#y+(this.#size)/2,3*growth, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
        }
    }

    intersects(x,y)
    {   
        let recX = this.#x-this.#size/2;
        let recY = this.#y-this.#size/2;
        let recL = this.#size*2;

        return recX<=x && x<=recX+recL
            && recY<=y && y<=recY+recL;
    }
    #x
    #y
    #size
}

class VolumeControl
{   
    constructor(x,y,width,height)
    {
        this.#x = x;
        this.#y = y;
        this.#width = width;
        this.#height = height;
        this.#hidden = true;
    }

    changeVisibility()
    {
        this.#hidden = !this.#hidden;
    }

    draw(ctx,volume,col)
    {
        if(!this.#hidden)
        {
            let keep = ctx.fillStyle;
            roundedRect(ctx,this.#x,this.#y,this.#width,this.#height,12);
            
            ctx.fillStyle = "rgba(0, 0, 0,0.8)";
            roundedRect(ctx,this.#x+this.#width/2-this.#width/10,this.#y+this.#height*0.25/2,this.#width/5,this.#height*0.75,4);

            ctx.fillStyle = col;
            roundedRect(ctx,this.#x+this.#width/2-this.#width/10,this.#y+this.#height*0.25/2+this.#height*0.75*(1-volume),this.#width/5,this.#height*0.75*volume,4);
            
            ctx.fillStyle = "white";
            roundedRect(ctx,this.#x+this.#width/2-this.#width/6,this.#y+this.#height*0.25/2+this.#height*0.75*(1-volume),this.#width/3,this.#width/3,7);
            
            ctx.fillStyle = keep;   
        }
    }

    intersects(x,y)
    {
        if(this.#hidden)
            return false;

        else
        {   
            let recX = this.#x+this.#width/4;
            let recY = this.#y+0.25*this.#height/2;
            let recW = this.#width/2;
            let recH = this.#height*0.75;

            return recX<=x && x<=recX+recW
            && recY<=y && y<=recY+recH;
        }
    }

    getPlace(y)
    {
        let end = this.#y+this.#height*0.25/2+10;
        let current = y-end;
        let start = this.#height*0.75-10;

        let proc = 1-Math.round(current/start*100)/100;

        if(proc<0.05)
            proc = 0
        if(proc>0.95)
            proc = 1;
        
        return proc;
    }

    #hidden
    #x
    #y
    #width
    #height
}

class Preview {
    constructor(width, height, source) {
      this.#working = true;
      this.#width = width;
      this.#height = height;
      this.#loaded1 = false;
      this.#loaded2 = false;

      this.#frameBuffer1 = document.createElement('video');
      this.#frameBuffer1.src = source;
      this.#frameBuffer1.addEventListener('loadedmetadata', () => {
        this.#loaded1 = true;
      });

      this.#frameBuffer2 = document.createElement('video');
      this.#frameBuffer2.src = source;
      this.#frameBuffer2.addEventListener('loadedmetadata', () => {
        this.#loaded2= true;
      });

      this.#ready1 = false;
      this.#ready2 = false;
    }
  
    draw(ctx, x, y, proc) {
        if (!this.#loaded1 || !this.#loaded2) return;
        
        if(this.#ready1)
        {
            ctx.drawImage(
                this.#frameBuffer1,
                x - this.#width / 2,
                y - this.#height / 2,
                this.#width,
                this.#height
              );
      
              ctx.strokeStyle = "white";
      
              ctx.strokeRect(         
                  x - this.#width / 2,
                  y - this.#height / 2,
                  this.#width,
                  this.#height
              );
      
              ctx.strokeStyle = "black";
        }

        if(this.#ready2)
        {
            ctx.drawImage(
                this.#frameBuffer2,
                x - this.#width / 2,
                y - this.#height / 2,
                this.#width,
                this.#height
              );
      
              ctx.strokeStyle = "white";
      
              ctx.strokeRect(         
                  x - this.#width / 2,
                  y - this.#height / 2,
                  this.#width,
                  this.#height
              );
      
              ctx.strokeStyle = "black";
        }

        if(!this.#ready1 && this.#working)
        {
            this.#working = false;
            this.#frameBuffer1.currentTime = proc*this.#frameBuffer1.duration;
            this.#frameBuffer1.addEventListener('seeked',() => {
              this.#ready1 = true;
              this.#ready2 = false;
              this.#working = true;
        },{once:true});
        }

        
        if (!this.#ready2 && this.#working)
        {
            this.#working = false;
            this.#frameBuffer2.currentTime = proc*this.#frameBuffer2.duration;
            this.#frameBuffer2.addEventListener('seeked',() => {
              this.#ready2 = true;
              this.#ready1 = false;
              this.#working = true;

        },{once:true});
        }

    }
    
    #working
    #frameBuffer1;
    #frameBuffer2;
    #width;
    #height;
    #ready1;
    #ready2;
    #loaded1;
    #loaded2;
  }



  class Video
  {
  
      /**
       * 
       * @param {string} name 
       * @param {Subtitles} subtitle 
       * @param {string} url 
       */
      constructor(name,subtitle,url,file=null)
      {
          this.file = file;
          this.name = name;
          this.subtitle = subtitle;
          this.url = url;
      }

  }
  
  class SRT_Tokener
  {
      /**
       * 
       * @param {string} str 
       */
      constructor(str)
      {
         this.#arr = str.split('\n');
      }   
  
      getNext()
      {
          
          this.text = "";
          
          if(this.#arr.length<3)
              return null;
  
          let count = 0;
          console.log(this.#arr.length);
  
          while(count<this.#arr.length && this.#arr[count].length>0)
          {
              
              if(count==0)
                  this.number = Number(this.#arr[count]);
  
              else if(count==1)
              {
                  let unformatted = this.#arr[count].split(">")[1];
                  let jump = 0;
                  
                  
                  while(unformatted[jump]==" ")
                  {
                      jump++;
                  }
  
                  unformatted = unformatted.slice(jump);
                  
                  const hms = unformatted.split(',')[0].split(':');
                  this.end = Number(hms[0])*3600+Number(hms[1])*60+Number(hms[2]);     
                  
              }
  
              else
              {
                  this.text+= this.#arr[count];
              }
                   
              count++;
          }
  
          while(this.#arr[count]?.length==0 && count<this.#arr.length) count++;
          
          this.#arr = this.#arr.slice(count);
          
          return this.#arr.length;
         
      }
      
      number = 0;
      text = "";
      end = 0;
      #arr;
  }
  
  class Subtitles
  {
      constructor(str)
      {
        if(str!==""){
          const tokener = new SRT_Tokener(str)
  
          while(tokener.getNext()!=null)
          {
             this.#objArray.push({text:tokener.text,end:tokener.end}); 
             
          }
        }
      }
  
      getSubtitle(current)
      {
          for(let i=0;i<this.#objArray.length;i++)
          {
              if(current<this.#objArray[i].end)
                  return this.#objArray[i].text;
          }
        
          return this.#objArray[this.#objArray.length-1].text;
      }
      
      getObjArray()
      {
        return this.#objArray;
      }

      setObjArray(arr)
      {
        this.#objArray = arr;
      }
      
      #objArray = []
  }
  
  
class SubtitleBar
{
    constructor(x,y,width,height)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * 
     * @param {String} text 
     * @param {RenderingContext} context 
     */
    draw(text,context)
    {
        let texts = [];
        let last = 0;
        while(last < text.length)
        {
            let first = last;
            last = Math.min(first+80,text.length);
            texts.push(text.slice(first,last));
        }

        let x = 0;
        let keep = context.fillStyle;

        while(x<texts.length)
        {
            context.fillStyle = "rgba(0,0,0,0.75)";
            context.fillRect(this.x-this.width/2,this.y-this.height/2-this.height*(texts.length-1-x),this.width,this.height);
            context.fillStyle = "rgba(255,255,255,0.75)";
            
            const size= this.width/50;
            
            context.font = size+"px serif";
            context.fillText(texts[x],this.x-texts[x].length*size/4, this.y+size/2-this.height*(texts.length-1-x));
            x++;
        }
        

        
        context.fillStyle = keep;
        
    }
}

class PlayListManager
{


    constructor() 
    {
        this.#root = document.querySelector(".container");
    };

    /**
     * 
     * @param {Array<Video>} videos 
     */
    buildDOM(videos)
    {
        this.#root.innerHTML = "";
        for(let i=0;i<videos.length;i++)
        {
            this.buildElement(i,videos);
        }
    }

    buildElement(pos,videos)
    {
        const elem = document.createElement("div");
        elem.classList.add("slide");
        
        const newVideo = document.createElement("div");
        newVideo.innerHTML = (pos+1)+". "+videos[pos].name;
        elem.appendChild(newVideo);

        newVideo.addEventListener("click",()=>
        {
            this.event = "videoChanged";
            this.eventPosition = pos;
        })

        const slideBtns = document.createElement("div");
        slideBtns.classList.add("slideBtns");

        if(pos!=0)
        {
            const buttonUp = document.createElement("button");
            buttonUp.innerHTML="&#8963";
            buttonUp.addEventListener("click",()=>
            {
                this.event = "posChangedUp";
                this.eventPosition = pos;
            });
            slideBtns.appendChild(buttonUp);
        }

        if(pos<videos.length-1)
        {
            const buttonDown = document.createElement("button");
            buttonDown.innerHTML="&#8964";
            buttonDown.addEventListener("click",()=>
            {
                this.event = "posChangedDown";
                this.eventPosition = pos;
            });
            slideBtns.appendChild(buttonDown);
        }

        elem.appendChild(slideBtns);

        if(videos.length>1){
        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML="Delete";
        deleteBtn.classList.add("del");
        deleteBtn.addEventListener("click",()=>
        {
            this.event = "deleted";
            this.eventPosition = pos;
        });

        elem.appendChild(deleteBtn);
    }
        this.#root.appendChild(elem);

    }

    refresh()
    {
        this.event = "";
    }

    #root;
    eventPosition = 0;
    event = "";
}
class VideoPlayer
{
    /**
     * 
     * @param {HTMLCanvasElement} canvas 
     * @param {Array<string>} videos
     */
    constructor(canvas,videos)
    {
        this.#canvas = canvas;
        this.#context = canvas.getContext('2d');
        this.#videos = videos;
        this.#currentVideo = document.createElement('video');
        this.#state = 0;
        this.#controlColor = "red";
        this.#showControls = false;
        this.#loaded = false;
        this.#mousedown = false;
        this.#autoplay = false;
        
        let effects = ['normal','heatmap','greyscale','threshold','invert','sepia','noise','iDontKnow','3D','emboss','edgeDetection','gaussianBlur']
        const effectPicker = document.querySelector(".effectPicker");
        for(let it of effects)
        {
            let item = document.createElement("li");
            let name = it[0].toUpperCase()+it.slice(1);
            item.innerHTML = name;
            item.addEventListener("click",()=>
            {
                this.#effect = it;
            });
            effectPicker.appendChild(item);
        }
        
        const outer = this;

        this.#autoplay = window.localStorage.getItem("autoplay");
        this.#subtitles = window.localStorage.getItem("subtitles");
        this.#effect = window.localStorage.getItem("effect");
        this.#volume = window.localStorage.getItem("volume");
        
        this.#playlistManager = new PlayListManager();
        this.#playlistManager.buildDOM(this.#videos);

        const toggleSub = document.querySelector(".togSub");
        const toggleAutoplay = document.querySelector(".togAuto");

        toggleSub.addEventListener("change",()=>
        {
            outer.#subtitles = toggleSub.checked;
            window.localStorage.setItem("subtitles",outer.#subtitles);
        });

        toggleAutoplay.addEventListener("change",()=>
        {
            outer.#autoplay = toggleAutoplay.checked;
            window.localStorage.setItem("autoplay",outer.#autoplay);
        });
        

        this.#canvas.addEventListener("mousemove", (e) =>
        {
            let bound = this.#canvas.getBoundingClientRect();
            this.#mouseX = (e.clientX-bound.left)/(bound.right-bound.left)*outer.#canvas.width;
            this.#mouseY= (e.clientY-bound.top)/(bound.bottom-bound.top)*outer.#canvas.height;
        });


        this.#canvas.addEventListener("mouseenter",(e)=>
        {
            outer.#showControls = true; 
            outer.#canvas.style.border="2px solid "+outer.#controlColor;
        });

        this.#canvas.addEventListener("mouseleave",(e)=>
        {
            outer.#showControls = false; 
            outer.#canvas.style.border="2px solid ";
        });


        this.#canvas.addEventListener("mousedown",(e)=>
        {
            outer.#mousedown = true;
        });
        

        this.#canvas.addEventListener("mouseup",(e)=>
        {
            outer.#mousedown = false;
        });

        this.#canvas.addEventListener("click",(e)=>
        {
            if(outer.#controlBar.intersects(this.#mouseX,this.#mouseY)
            &&!outer.#playingButtonBar.intersects(this.#mouseX,this.#mouseY))
            {
                if(outer.#arrowLeft.intersects(outer.#mouseX,outer.#mouseY) && 
                   outer.#playerIndex>0)
                {
                    outer.#playerIndex--;
                    outer.#loaded = false;
                    outer.#state = 0;
                    if(outer.#autoplay==false)
                        outer.#controlColor = "red";
                    else
                        outer.#controlColor = "green";
                    outer.#canvas.style.border="2px solid "+outer.#controlColor;
                    outer.#currentVideo.src = outer.#videos[outer.#playerIndex].url;
                }
                if(outer.#arrowRight.intersects(outer.#mouseX,outer.#mouseY) &&
                   outer.#playerIndex<outer.#videos.length-1)
                {
                    outer.#playerIndex++;
                    outer.#loaded = false;
                    outer.#state = 0;
                    if(outer.#autoplay==false)
                        outer.#controlColor = "red";
                    else
                        outer.#controlColor = "green";
                    outer.#canvas.style.border="2px solid "+outer.#controlColor;
                    outer.#currentVideo.src = outer.#videos[outer.#playerIndex].url;
                }

                if(outer.#volumeButton.intersects(outer.#mouseX,outer.#mouseY))
                    outer.#volumeControl.changeVisibility();
                return;
            }

            if(!outer.#state)
            {
                outer.#canvas.style.border="2px solid "+"green";
                outer.#currentVideo.play();
            }

            if(outer.#state)
            {
                outer.#canvas.style.border="2px solid "+"red";
                outer.#currentVideo.pause();
            }
            
        });

        this.#currentVideo.addEventListener('loadedmetadata', function() {

            const current = document.querySelector(".currently");
            current.innerHTML = "Currently Playing : "+outer.#videos[outer.#playerIndex].name+" &#8964";

            outer.#canvas.width = outer.#currentVideo.videoWidth;
            outer.#canvas.height = outer.#currentVideo.videoHeight;
            outer.#context.drawImage(outer.#currentVideo, 0, 0);

            outer.#playingButton = new PlayButton(outer.#canvas.width/2,outer.#canvas.height/2,outer.#canvas.width/20);
            outer.#controlBar = new ControlBar(0,outer.#canvas.height-outer.#canvas.height/12,outer.#canvas.width,outer.#canvas.height/12)
            
            let pbL = (outer.#canvas.width*0.15)/6;
            let pbX = (outer.#canvas.width*0.15)*0.2;
            let pbY = outer.#canvas.height-outer.#canvas.height/12+outer.#canvas.height/24; 
            outer.#playingButtonBar = new PlayButton(pbX,pbY,pbL);
            
            let alL = pbL*0.8
            let alX = (outer.#canvas.width*0.065);
            let alY = outer.#canvas.height-(pbL/2)/0.75;
            outer.#arrowLeft = new Arrow(arrowObj,new Vec2(alX,alY),alL);
            outer.#arrowRight = new Arrow(arrowObj,new Vec2(alX+alL*3/2,alY),alL);
            outer.#arrowRight.rotate(180);
            
            let loadX = outer.#canvas.width*0.15
            let loadY = outer.#canvas.height-outer.#canvas.height/24;
            let loadW = outer.#canvas.width*0.7;
            let loadH = outer.#canvas.height/(12*10);
            outer.#loadingBar = new LoadingBar(loadX,loadY,loadW,loadH);

            let timerX = outer.#canvas.width*0.15;
            let timerY = outer.#canvas.height-outer.#canvas.height/24;
            let num = outer.#canvas.height/48;
            outer.#timer = new Timer(timerX,timerY,loadW,num)

            let l = (outer.#canvas.width*0.15)/6;
            let volY = outer.#canvas.height-outer.#canvas.height/24-outer.#canvas.height/24/3;
            let volX = outer.#canvas.width-25*((outer.#canvas.width*0.15)*0.2-l);
            let volL = outer.#canvas.height/36;
            outer.#volumeButton = new VolumeButton(volX,volY,volL);
            
            let audioX = outer.#canvas.width-25*((outer.#canvas.width*0.15)*0.2-l);
            let audioY = outer.#canvas.height - outer.#canvas.height/12 - outer.#canvas.height/6 - outer.#canvas.height/120 ;
            let audioH = outer.#canvas.height/6;
            let audioW = outer.#canvas.height/24;
            outer.#volumeControl = new VolumeControl(audioX,audioY,audioW,audioH);
            
            let aspectRatio = outer.#canvas.width/outer.#canvas.height;
            let prevW = outer.#canvas.width/10;
            let prevH = prevW/aspectRatio;
            outer.#preview = new Preview(prevW,prevH,outer.#currentVideo.src);
            
            let subW = outer.#canvas.width/1.2;
            let subH = outer.#canvas.height/20;
            let subX = outer.#canvas.width/2;
            let subY = outer.#canvas.height-subH/2-outer.#canvas.height/12;
            outer.#subtitleBar = new SubtitleBar(subX,subY,subW,subH);


            outer.#loaded = true;
            if(outer.#autoplay)
                outer.#currentVideo.play();
         });

        this.#currentVideo.addEventListener('play', function() {
            outer.#state = 1;   
            outer.#controlColor = "green"
        }, 0);

        this.#currentVideo.addEventListener('pause', function() {
            outer.#state = 0;
            outer.#controlColor = "red";
          }, 0);
        
          this.#currentVideo.volume = this.#volume;
          this.#currentVideo.src = this.#videos[0].url;
          this.#playerIndex = 0;
    }

    requestDOMRebuild()
    {
        this.#playlistManager.buildDOM(this.#videos);
    }

    start()
    {
        const vid = this.#currentVideo;
        const outer = this;
        
        (function loop() 
        {   
            let pos = 0;
            switch(outer.#playlistManager.event)
            {
                case "videoChanged":
                    outer.#playerIndex = outer.#playlistManager.eventPosition;
                    outer.#loaded = false;
                    outer.#state = 0;
                    if(outer.#autoplay==false)
                        outer.#controlColor = "red";
                    else
                        outer.#controlColor = "green";
                    outer.#canvas.style.border="2px solid "+outer.#controlColor;
                    outer.#currentVideo.src = outer.#videos[outer.#playlistManager.eventPosition].url;
                    break;
                
                 case "posChangedUp":
                    pos = outer.#playlistManager.eventPosition;
                    if(outer.#playerIndex == pos-1)
                        outer.#playerIndex = pos;
                    [outer.#videos[pos],outer.#videos[pos-1]] = [outer.#videos[pos-1],outer.#videos[pos]];                    
                    outer.#playlistManager.buildDOM(outer.#videos);
                    break;        

                case "posChangedDown":
                    pos = outer.#playlistManager.eventPosition;
                    if(outer.#playerIndex == pos+1)
                       outer.#playerIndex = pos;
                    [outer.#videos[pos],outer.#videos[pos+1]] = [outer.#videos[pos+1],outer.#videos[pos]];                    
                    outer.#playlistManager.buildDOM(outer.#videos);
                    break;  

                case "deleted":
                    pos = outer.#playlistManager.eventPosition;
                    outer.#videos.splice(pos,1);

                    if(pos==outer.#playerIndex){
                        outer.#playerIndex = 0;
                        outer.#loaded = false;
                        outer.#state = 0;
                        if(outer.#autoplay==false)
                            outer.#controlColor = "red";
                        else
                            outer.#controlColor = "green";
                        outer.#canvas.style.border="2px solid "+outer.#controlColor;
                        outer.#currentVideo.src = outer.#videos[0].url;
                    }
                    
                    else if(pos<outer.#playerIndex)
                        outer.#playerIndex--;

                    
                    outer.#playlistManager.buildDOM(outer.#videos);
                    break;
            }

            outer.#playlistManager.refresh();


            if(outer.#loaded)
        {   

            if(vid.ended )
            {
                if(outer.#videos.length==1)
                {
                    outer.#currentVideo.currentTime = 0;
                }

                else
                {
                if(outer.#playerIndex<outer.#videos.length-1)
                    outer.#playerIndex++;
                else
                    outer.#playerIndex = 0;

                outer.#loaded = false;
                outer.#state = 0;
                outer.#controlColor = "red";
                if(outer.#showControls)
                    outer.#canvas.style.border="2px solid "+outer.#controlColor;
                outer.#currentVideo.src = outer.#videos[outer.#playerIndex].url;

                }   
            }

            else
            {
            outer.#context.clearRect(0,0,outer.#canvas.width,outer.#canvas.height);
            outer.#context.drawImage(vid, 0, 0);
            if(outer.#videos[outer.#playerIndex].subtitle!=null && outer.#subtitles)
            {
                const text = outer.#videos[outer.#playerIndex].subtitle.getSubtitle(vid.currentTime);
                outer.#subtitleBar.draw(text,outer.#context);
            }
            
            if(outer.#effect!=="")
            {
            const image = outer.#context.getImageData(0,0,outer.#canvas.width,outer.#canvas.height);
            applyEffect(image,outer.#effect);
            outer.#context.putImageData(image,0,0);
            }
            
            if(outer.#showControls)
            {
                outer.#context.fillStyle = "rgba(255, 255, 255,0.7)";

                outer.#controlBar.draw(outer.#context);
                outer.#playingButton.draw(outer.#context,outer.#state);
                outer.#volumeControl.draw(outer.#context,outer.#currentVideo.volume,outer.#controlColor);

                if(outer.#mousedown)
                {
                    if(outer.#loadingBar.intersects(outer.#mouseX,outer.#mouseY))
                    {
                        let start = outer.#canvas.width*0.15;
                        let current = outer.#mouseX - start;
                        let end = outer.#canvas.width*0.7;

                        let proc = current/end;

                        outer.#currentVideo.currentTime = proc*outer.#currentVideo.duration;
                    }
                    if(outer.#volumeControl.intersects(outer.#mouseX,outer.#mouseY))
                    {   
                        outer.#currentVideo.volume = outer.#volumeControl.getPlace(outer.#mouseY);
                        window.localStorage.setItem("volume",outer.#currentVideo.volume);
                    }
                }

                outer.#context.fillStyle = "rgba(0, 0, 0,0.8)";
                outer.#playingButtonBar.draw(outer.#context,outer.#state);
                outer.#arrowLeft.draw(outer.#context,outer.#playerIndex,outer.#videos.length,0);
                outer.#arrowRight.draw(outer.#context,outer.#playerIndex,outer.#videos.length,1);
                outer.#loadingBar.draw(outer.#context,outer.#currentVideo.currentTime,outer.#currentVideo.duration,outer.#controlColor);
                outer.#timer.draw(outer.#context,outer.#currentVideo.currentTime,outer.#currentVideo.duration);
                outer.#volumeButton.draw(outer.#context,outer.#currentVideo.volume);

                if(outer.#loadingBar.intersects(outer.#mouseX, outer.#mouseY))
                {
                    let start = outer.#canvas.width*0.15;
                    let current = outer.#mouseX - start;
                    let end = outer.#canvas.width*0.7;

                    let proc = current/end;

                    let aspectRatio = outer.#canvas.width/outer.#canvas.height;
                    let prevW = outer.#canvas.width/10;
                    let prevH = prevW/aspectRatio;
                    
                    outer.#preview.draw(outer.#context,outer.#mouseX,
                                        outer.#canvas.height-outer.#canvas.height/12-prevH,
                                        proc);
                                    
                }
            }
                
            }
           
        }
            setTimeout(loop, 1000 / 60);
          })();
    }

    #playlistManager;
    #effect = "";
    #autoplay;
    #subtitles;
    #volume;
    #subtitleBar;
    #preview
    #volumeControl
    #volumeButton
    #mousedown
    #timer
    #loadingBar
    #playerIndex
    #arrowLeft
    #arrowRight
    #playingButtonBar
    #mouseX
    #mouseY
    #controlBar
    #loaded
    #playingButton
    #showControls
    #controlColor
    #state
    #canvas
    #currentVideo
    #context
    #videos
}

function initStorage(arr)
{

    if(window.localStorage.getItem("autoplay")===null)
        window.localStorage.setItem("autoplay",false);

    if(window.localStorage.getItem("subtitles")===null)
        window.localStorage.setItem("subtitles",false);

    if(window.localStorage.getItem("effect")===null)
        window.localStorage.setItem("effect","");

    if(window.localStorage.getItem("volume")===null)
        window.localStorage.setItem("volume",1);
}




const addVideo = document.querySelector(".addvideo");
const avButton = document.querySelector(".avButton");

let videoUrl = null;
let subtitles = null;
let videoName = "";  
let videoFile = null;

const videoArray = [
    new Video("Pond Video 1",null,'media/pond1.mp4'),
    new Video("Pond Video 2",null,'media/pond2.mp4')
];

const videoSubmit = document.getElementById("videobutton");
const videoNameInput = document.getElementById("videoname");
const videoInput = document.getElementById("videodata");    
const videoSubInput = document.getElementById("videosub"); 

const playlist = document.querySelector(".playlist");
const currently = document.querySelector(".currently");
currently.addEventListener("click",()=>
{
    if(playlist.style.overflow === "hidden")
    {
        playlist.style.overflow ="visible";
    }
    else
        playlist.style.overflow ="hidden";
});


avButton.addEventListener("click",()=>
{
    if(addVideo.style.overflow==="hidden")
        addVideo.style.overflow = "visible";
    else
        addVideo.style.overflow = "hidden";
});

const sButton = document.querySelector(".sButton");
const effButton = document.querySelector(".effButton");

effButton.addEventListener("click",()=>
{
        const parent = document.querySelector(".effectsControl");
        if(parent.style.overflow=="hidden")
            parent.style.overflow = "visible";
        else
            parent.style.overflow="hidden";
})

sButton.addEventListener("click",()=>
{
    const parent = document.querySelector(".settings");
    if(parent.style.overflow=="hidden")
        parent.style.overflow = "visible";
    else
        parent.style.overflow="hidden";
})


initStorage(videoArray);
const player  = new VideoPlayer(document.querySelector("canvas"),videoArray);
player.start();

videoSubInput.addEventListener("change",()=>
    {
        if(videoSubInput.files.length==1)
        {
            const file = videoSubInput.files[0];
            const fileReader = new FileReader();
            fileReader.readAsText(file);
            fileReader.addEventListener("loadend",()=>
            {
                const str = fileReader.result;
                subtitles = new Subtitles(str);
            });
        }
    });
    
    videoInput.addEventListener("change",()=>
    {
        if(videoInput.files.length==1)
            {
                const file = videoInput.files[0];
                videoFile = file;
                videoUrl = URL.createObjectURL(file);
            }
    })
    
    videoNameInput.addEventListener("change",(e)=>
    {
        videoName = videoNameInput.value;
    });
    
    
    videoSubmit.addEventListener("click",(e)=>
    {
        e.preventDefault();
        if(videoUrl!==null && videoName!=="")
        {
    
            const video = new Video(videoName,subtitles,videoUrl,videoFile);
            videoArray.push(video);
            player.requestDOMRebuild();

            videoNameInput.value = "";
            videoSubInput.value = "";
            videoInput.value = "";
    
            videoUrl = null;
            subtitles = null;
            videoFile = null;
            videoName = "";  
        }
    })