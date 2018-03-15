/**
 * Created by AK4TRL on 2017/7/3.
 */

Animatedgrid = function(id, val, wth, hgt,  xJust, yJust, fillColor, edgeColor)
{
    this.w = wth;
    this.h = hgt;
    this.xJustify = xJust;
    this.yJustify = yJust;
    this.label = val;
    this.labelColor = edgeColor

    this.backgroundColor = fillColor;
    this.foregroundColor = edgeColor;
    this.labelColor = this.foregroundColor;
    this.highlighted = false;
    this.objectID = id;
    this.nullPointer = false;
    this.alpha = 1.0;
    this.addedToScene = true;

}

Animatedgrid.prototype = new AnimatedObject();
Animatedgrid.prototype.constructor = Animatedgrid;

Animatedgrid.prototype.setNull = function(np)
{
    this.nullPointer = np;
}

Animatedgrid.prototype.getNull = function()
{
    return this.nullPointer;
}


Animatedgrid.prototype.left = function()
{
    if (this.xJustify == "left")
    {
        return  this.x;
    }
    else if (this.xJustify == "center")
    {
        return this.x - this.w / 2.0;
    }
    else // (this.xJustify == "right")
    {
        return this.x - this.w;
    }

}

Animatedgrid.prototype.centerX = function()
{
    if (this.xJustify == "center")
    {
        return this.x;
    }
    else if (this.xJustify == "left")
    {
        return this.x + this.w / 2.0;
    }
    else // (this.xJustify == "right")
    {
        return this.x - this.w / 2.0;
    }
}

Animatedgrid.prototype.centerY = function()
{
    if (this.yJustify == "center")
    {
        return this.y;
    }
    else if (this.yJustify == "top")
    {
        return this.y + this.h / 2.0;
    }
    else // (this.xJustify == "bottom")
    {
        return this.y - this.w / 2.0;
    }

}

Animatedgrid.prototype.top = function()
{
    if (this.yJustify == "top")
    {
        return  this.y;
    }
    else if (this.yJustify == "center")
    {
        return this.y - this.h / 2.0;
    }
    else //(this.xJustify == "bottom")
    {
        return this.y - this.h;
    }
}

Animatedgrid.prototype.bottom = function()
{
    if (this.yJustify == "top")
    {
        return  this.y + this.h;
    }
    else if (this.yJustify == "center")
    {
        return this.y + this.h / 2.0;
    }
    else //(this.xJustify == "bottom")
    {
        return this.y;
    }
}


Animatedgrid.prototype.right = function()
{
    if (this.xJustify == "left")
    {
        return  this.x + this.w;
    }
    else if (this.xJustify == "center")
    {
        return this.x + this.w / 2.0;
    }
    else // (this.xJustify == "right")
    {
        return this.x;
    }
}


Animatedgrid.prototype.getHeadPointerAttachPos = function(fromX, fromY)
{
    return this.getClosestCardinalPoint(fromX, fromY);
}


Animatedgrid.prototype.setWidth = function(wdth)
{
    this.w = wdth;
}


Animatedgrid.prototype.setHeight = function(hght)
{
    this.h = hght;
}

Animatedgrid.prototype.getWidth = function()
{
    return this.w;
}

Animatedgrid.prototype.getHeight = function()
{
    return this.h;
}


// TODO:  Fix me!
Animatedgrid.prototype.draw = function(context)
{
    if (!this.addedToScene)
    {
        return;
    }

    var startX;
    var startY;
    var labelPosX;
    var labelPosY;

    context.globalAlpha = this.alpha;

    if (this.xJustify == "left")
    {
        startX = this.x;
        labelPosX = this.x + this.w / 2.0;
    }
    else if (this.xJustify == "center")
    {
        startX = this.x-this.w / 2.0;
        labelPosX = this.x;

    }
    else if (this.xJustify == "right")
    {
        startX = this.x-this.w;
        labelPosX = this.x - this.w / 2.0
    }
    if (this.yJustify == "top")
    {
        startY = this.y;
        labelPosY = this.y + this.h / 2.0;
    }
    else if (this.yJustify == "center")
    {
        startY = this.y - this.h / 2.0;
        labelPosY = this.y;

    }
    else if (this.yJustify == "bottom")
    {
        startY = this.y - this.h;
        labelPosY = this.y - this.h / 2.0;
    }

    context.lineWidth = 1;

    if (this.highlighted)
    {
        context.strokeStyle = "#ff0000";
        context.fillStyle = "#ff0000";

        context.beginPath();
        context.moveTo(startX - this.highlightDiff,startY- this.highlightDiff);
        context.lineTo(startX+this.w + this.highlightDiff,startY- this.highlightDiff);
        context.lineTo(startX+this.w+ this.highlightDiff,startY+this.h + this.highlightDiff);
        context.lineTo(startX - this.highlightDiff,startY+this.h + this.highlightDiff);
        context.lineTo(startX - this.highlightDiff,startY - this.highlightDiff);
        context.closePath();
        context.stroke();
        context.fill();

    }
    context.strokeStyle = this.foregroundColor;
    context.fillStyle = this.backgroundColor;

    context.beginPath();
    context.moveTo(startX ,startY);
    context.lineTo(startX + this.w, startY);
    context.lineTo(startX + this.w, startY + this.h);
    context.lineTo(startX, startY + this.h);
    context.lineTo(startX, startY);
    context.closePath();
    context.stroke();
    context.fill();

    if (this.nullPointer)
    {
        context.beginPath();
        context.moveTo(startX ,startY);
        context.lineTo(startX + this.w, startY + this.h);
        context.closePath();
        context.stroke();
    }

    context.fillStyle = this.labelColor;

    context.textAlign = 'center';
    context.font         = '24px sans-serif';
    context.textBaseline   = 'middle';
    context.lineWidth = 1;
    context.fillText(this.label, this.x, this.y - 20);
}

Animatedgrid.prototype.setText = function(newText, textIndex)
{
    this.label = newText;
    // TODO:  setting text position?
}


Animatedgrid.prototype.createUndoDelete = function()
{
    // TODO: Add color?
    return new UndoDeleteRectangle(this.objectID, this.label, this.x, this.y, this.w, this.h, this.xJustify, this.yJustify, this.backgroundColor, this.foregroundColor, this.highlighted, this.layer);
}

Animatedgrid.prototype.setHighlight = function(value)
{
    this.highlighted = value;
}


