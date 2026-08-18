//////////////////////////////////////////
//
// NOTE: This is *not* a valid shader file
//
///////////////////////////////////////////
Shader "Unlit/EGSpriteAlphaMask (AlphaClip)" {
Properties {
 _MainTex ("Base (RGB), Alpha (A)", 2D) = "white" {}
 _AlphaMask ("AlphaMask ( A )", 2D) = "" {}
}
SubShader { 
 LOD 100
 Tags { "QUEUE"="Transparent" "IGNOREPROJECTOR"="true" "RenderType"="Transparent" }
 Pass {
  Tags { "QUEUE"="Transparent" "IGNOREPROJECTOR"="true" "RenderType"="Transparent" }
  ZWrite Off
  Cull Off
  Fog { Mode Off }
  Blend SrcAlpha OneMinusSrcAlpha
  ColorMask RGB
  Offset -1, -1
Program "vp" {
SubProgram "gles " {
"!!GLES


#ifdef VERTEX

attribute vec4 _glesVertex;
attribute vec4 _glesColor;
attribute vec4 _glesMultiTexCoord0;
uniform highp mat4 glstate_matrix_mvp;
uniform highp vec4 _MainTex_ST;
varying mediump vec4 xlv_COLOR;
varying highp vec2 xlv_TEXCOORD0;
varying highp vec2 xlv_TEXCOORD1;
void main ()
{
  gl_Position = (glstate_matrix_mvp * _glesVertex);
  xlv_COLOR = _glesColor;
  xlv_TEXCOORD0 = _glesMultiTexCoord0.xy;
  xlv_TEXCOORD1 = ((_glesVertex.xy * _MainTex_ST.xy) + _MainTex_ST.zw);
}



#endif
#ifdef FRAGMENT

uniform sampler2D _MainTex;
uniform sampler2D _AlphaMask;
varying mediump vec4 xlv_COLOR;
varying highp vec2 xlv_TEXCOORD0;
varying highp vec2 xlv_TEXCOORD1;
void main ()
{
  mediump vec4 tmpvar_1;
  highp vec4 alphaMask_2;
  highp vec4 col_3;
  lowp vec4 tmpvar_4;
  tmpvar_4 = texture2D (_MainTex, xlv_TEXCOORD0);
  mediump vec4 tmpvar_5;
  tmpvar_5 = (tmpvar_4 * xlv_COLOR);
  col_3.xyz = tmpvar_5.xyz;
  lowp vec4 tmpvar_6;
  tmpvar_6 = texture2D (_AlphaMask, xlv_TEXCOORD0);
  alphaMask_2 = tmpvar_6;
  col_3.w = (alphaMask_2.w * xlv_COLOR.w);
  highp vec2 tmpvar_7;
  tmpvar_7 = abs(xlv_TEXCOORD1);
  highp vec4 tmpvar_8;
  tmpvar_8 = (col_3 * ceil(clamp (
    (1.0 - max (tmpvar_7.x, tmpvar_7.y))
  , 0.0, 1.0)));
  col_3 = tmpvar_8;
  tmpvar_1 = tmpvar_8;
  gl_FragData[0] = tmpvar_1;
}



#endif"
}
SubProgram "gles3 " {
"!!GLES3#version 300 es


#ifdef VERTEX


in vec4 _glesVertex;
in vec4 _glesColor;
in vec4 _glesMultiTexCoord0;
uniform highp mat4 glstate_matrix_mvp;
uniform highp vec4 _MainTex_ST;
out mediump vec4 xlv_COLOR;
out highp vec2 xlv_TEXCOORD0;
out highp vec2 xlv_TEXCOORD1;
void main ()
{
  gl_Position = (glstate_matrix_mvp * _glesVertex);
  xlv_COLOR = _glesColor;
  xlv_TEXCOORD0 = _glesMultiTexCoord0.xy;
  xlv_TEXCOORD1 = ((_glesVertex.xy * _MainTex_ST.xy) + _MainTex_ST.zw);
}



#endif
#ifdef FRAGMENT


layout(location=0) out mediump vec4 _glesFragData[4];
uniform sampler2D _MainTex;
uniform sampler2D _AlphaMask;
in mediump vec4 xlv_COLOR;
in highp vec2 xlv_TEXCOORD0;
in highp vec2 xlv_TEXCOORD1;
void main ()
{
  mediump vec4 tmpvar_1;
  highp vec4 alphaMask_2;
  highp vec4 col_3;
  lowp vec4 tmpvar_4;
  tmpvar_4 = texture (_MainTex, xlv_TEXCOORD0);
  mediump vec4 tmpvar_5;
  tmpvar_5 = (tmpvar_4 * xlv_COLOR);
  col_3.xyz = tmpvar_5.xyz;
  lowp vec4 tmpvar_6;
  tmpvar_6 = texture (_AlphaMask, xlv_TEXCOORD0);
  alphaMask_2 = tmpvar_6;
  col_3.w = (alphaMask_2.w * xlv_COLOR.w);
  highp vec2 tmpvar_7;
  tmpvar_7 = abs(xlv_TEXCOORD1);
  highp vec4 tmpvar_8;
  tmpvar_8 = (col_3 * ceil(clamp (
    (1.0 - max (tmpvar_7.x, tmpvar_7.y))
  , 0.0, 1.0)));
  col_3 = tmpvar_8;
  tmpvar_1 = tmpvar_8;
  _glesFragData[0] = tmpvar_1;
}



#endif"
}
}
Program "fp" {
SubProgram "gles " {
"!!GLES"
}
SubProgram "gles3 " {
"!!GLES3"
}
}
 }
}
SubShader { 
 LOD 100
 Tags { "QUEUE"="Transparent" "IGNOREPROJECTOR"="true" "RenderType"="Transparent" }
 Pass {
  Tags { "QUEUE"="Transparent" "IGNOREPROJECTOR"="true" "RenderType"="Transparent" }
  ZWrite Off
  Cull Off
  Fog { Mode Off }
  Blend SrcAlpha OneMinusSrcAlpha
  ColorMask RGB
  ColorMaterial AmbientAndDiffuse
  Offset -1, -1
  SetTexture [_MainTex] { combine texture * primary }
 }
}
}