{{/*
Expand the name of the chart.
*/}}
{{- define "api.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "api.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "api.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Get Service name of other deployments within the cluster
*/}}

{{- define "api.rabbitmqservicename" -}}
{{- $serv_name:= include "rabbitmq.fullname" (dict "Values" $.Values.rabbitmq "Chart" (dict "Name" "rabbitmq") "Release" $.Release) }}
{{- printf "%s" $serv_name }}
{{- end }}

{{- define "api.postgresservicename" -}}
{{- $serv_name:= include "api.fullname" (dict "Values" $.Values.postgresql "Chart" (dict "Name" "postgresql") "Release" $.Release) }}
{{- printf "%s" $serv_name }}
{{- end }}

{{- define "api.rediservicename" -}}
{{- $serv_name:= include "api.fullname" (dict "Values" $.Values.redis "Chart" (dict "Name" "redis") "Release" $.Release) }}
{{- printf "%s" $serv_name }}
{{- end }}


{{/*
Common labels
*/}}
{{- define "api.labels" -}}
helm.sh/chart: {{ include "api.chart" . }}
{{ include "api.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "api.selectorLabels" -}}
app.kubernetes.io/name: {{ include "api.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "api.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "api.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}



{/* NAME OF THE SERVICE MANIFEST */}}
{{- define "api.servicename" -}}
  {{- printf "%s-service" (include "api.fullname" .) -}}
{{- end -}}
