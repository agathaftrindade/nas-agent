#!/usr/bin/env bash

aws dynamodb create-table \
    --endpoint-url http://localhost:9000 \
    --table-name HealthUpdates \
    --attribute-definitions AttributeName=Device,AttributeType=S \
    --key-schema AttributeName=Device,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1;

aws dynamodb create-table \
    --endpoint-url http://localhost:9000 \
    --table-name PowerCommands \
    --attribute-definitions AttributeName=Device,AttributeType=S AttributeName=Timestamp,AttributeType=N \
    --key-schema AttributeName=Device,KeyType=HASH AttributeName=Timestamp,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1;
