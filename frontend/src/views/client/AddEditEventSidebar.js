/* eslint-disable no-constant-condition */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// ** React Imports
import { Fragment, useState } from 'react';
import classnames from 'classnames';
import { X } from 'react-feather';
import toast from 'react-hot-toast';
import Flatpickr from 'react-flatpickr';
import Select, { components } from 'react-select' // eslint-disable-line
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useForm, Controller } from 'react-hook-form';

// ** Reactstrap Imports
import { Button, Modal, ModalHeader, ModalBody, Label, Form, Badge } from 'reactstrap';

import { isObjEmpty, selectThemeColors } from '../../utils/Utils';

const AddEditEventSidebar = (props) => {
  // ** Props
  const { open, calendarApi, selectedEvent, handleAddEventSidebar, entities, events, setEvents, createOrder, providerData, selectedProviderType, deleteOrder } =
    props;
  const {
    control,
    register,
    setError,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm();
  const [validDate, setValidDate] = useState('');
  const [endPicker, setEndPicker] = useState();
  const [startPicker, setStartPicker] = useState();
  const [calendarLabel, setCalendarLabel] = useState([{ value: '', label: '', color: 'primary' }]);
  // ** Select Options
  const options = entities
    ? entities
        .map((entity) => {
          if (`${entity.entype}sitter` === selectedProviderType) {
            return { value: entity._id, label: entity.name, color: 'primary', entype: entity.entype };
          } else {
            return null; // Return null for entities that don't match the condition
          }
        })
        .filter(Boolean) // Filter out null values from the array
    : [];

  // ** Custom select components
  const OptionComponent = ({ data, ...props }) => {
    return (
      <components.Option {...props}>
        <span className={`bullet bullet-${data.color} bullet-sm me-50`}></span>
        {data.label}
      </components.Option>
    );
  };

  // ** Adds New Event
  const handleAddEvent = async (data) => {
    data.type = data.entity.entype;
    data.entity = data.entity.value;
    data.provider = providerData;
    try {
      const response = await createOrder(data);
      if (!response.error) {
        data._id = response.data._id;
        setEvents((prevData) => [...prevData, data]);
      }
    } catch (err) {
      console.log(err);
    }
    handleAddEventSidebar();
  };

  // ** Reset Input Values on Close
  const handleResetInputValues = () => {
    setValue('title', '');
    setCalendarLabel([{ value: '', label: '', color: '' }]);
    setStartPicker();
    setEndPicker();
  };

  // ** Set sidebar fields
  const handleSelectedEvent = () => {
    if (!isObjEmpty(selectedEvent)) {
      const fields = ['title', 'description'];
      fields.forEach((field) => setValue(field, selectedEvent[field] ? selectedEvent[field] : selectedEvent.extendedProps[field]));
      setValue('entity', selectedEvent.entity ? selectedEvent.entity : options.find((option) => option.value == selectedEvent.extendedProps['entity']));
      setValue('start', selectedEvent.start);
      setValue('end', selectedEvent.end);
    }
  };

  // ** (UI) updateEventInCalendar
  const updateEventInCalendar = (updatedEventData, propsToUpdate, extendedPropsToUpdate) => {
    const existingEvent = calendarApi.getEventById(updatedEventData.id);

    for (let index = 0; index < propsToUpdate.length; index++) {
      const propName = propsToUpdate[index];
      existingEvent.setProp(propName, updatedEventData[propName]);
    }

    // ** Set date related props
    // ? Docs: https://fullcalendar.io/docs/Event-setDates
    existingEvent.setDates(new Date(updatedEventData.start), new Date(updatedEventData.end), {
      allDay: updatedEventData.allDay
    });

    for (let index = 0; index < extendedPropsToUpdate.length; index++) {
      const propName = extendedPropsToUpdate[index];
      existingEvent.setExtendedProp(propName, updatedEventData.extendedProps[propName]);
    }
  };

  // ** Updates Event in Store
  const handleUpdateEvent = () => {
    handleSubmit(onSubmit)();
  };

  // ** (UI) removeEventInCalendar
  const removeEventInCalendar = (eventId) => {
    calendarApi.getEventById(eventId).remove();
  };

  const handleDeleteEvent = async () => {
    const orderId = selectedEvent.extendedProps._id;
    const tempEvents = events.filter((event) => event._id != orderId);
    setEvents(tempEvents);
    await deleteOrder(orderId);
    handleAddEventSidebar();
    toast.error('Order Removed');
  };

  const onSubmit = (data) => {
    if (data.title.length) {
      if (isObjEmpty(errors)) {
        if (isObjEmpty(selectedEvent) || (!isObjEmpty(selectedEvent) && !selectedEvent.title.length)) {
          if (new Date(data.start) >= new Date(data.end)) {
            setValidDate('End Date cannot be eqaul or small than Start Date');
          } else {
            setValidDate('');
            handleAddEvent(data);
          }
        } else {
          // handleUpdateEvent();
        }
        // handleAddEventSidebar();
      }
    } else {
      setError('title', {
        type: 'manual'
      });
    }
  };

  // ** Event Action buttons
  const EventActions = () => {
    if (isObjEmpty(selectedEvent) || (!isObjEmpty(selectedEvent) && !selectedEvent.title.length)) {
      return (
        <Fragment>
          <Button className="me-1" size="sm" type="submit" color="primary">
            Add
          </Button>
          <Button color="secondary" size="sm" type="reset" onClick={handleAddEventSidebar} outline>
            Cancel
          </Button>
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          {/* <Button className="me-1" size="sm" color="primary" onClick={handleUpdateEvent}>
            Update
          </Button> */}
          <Button color="danger" size="sm" onClick={handleDeleteEvent} outline>
            Delete
          </Button>
        </Fragment>
      );
    }
  };

  // ** Close BTN
  const CloseBtn = <X className="cursor-pointer" size={15} onClick={handleAddEventSidebar} />;
  return (
    <Modal
      isOpen={open}
      className="sidebar-lg"
      toggle={handleAddEventSidebar}
      onOpened={handleSelectedEvent}
      onClosed={handleResetInputValues}
      contentClassName="p-0 overflow-hidden"
      modalClassName="modal-slide-in event-sidebar">
      <ModalHeader className="mb-1" toggle={handleAddEventSidebar} close={CloseBtn} tag="div">
        <h5 className="modal-title">{selectedEvent && selectedEvent.title && selectedEvent.title.length ? 'Update' : 'Add'} Order</h5>
      </ModalHeader>
      <PerfectScrollbar options={{ wheelPropagation: false }}>
        <ModalBody className="flex-grow-1 pb-sm-0 pb-3">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-1 row">
              <Badge color="danger">{validDate}</Badge>
            </div>
            <div className="mb-1">
              <Label className="form-label" for="title">
                Title <span className="text-danger">*</span>
              </Label>
              <input
                className={`form-control ${classnames({ 'is-invalid': errors.title })}`}
                type="text"
                id="title"
                placeholder="Title"
                {...register('title', { required: true })}
              />
              {errors.title && <span className="small text-danger">Title is required.</span>}
            </div>

            <div className="mb-1">
              <Label className="form-label" for="label">
                Entity <span className="text-danger">*</span>
              </Label>
              <Controller
                name="entity"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    isClearable
                    value={calendarLabel}
                    options={options}
                    theme={selectThemeColors}
                    classNamePrefix="select"
                    className={classnames('react-select', { 'is-invalid': errors.entity })}
                    {...field}
                    components={{
                      Option: OptionComponent
                    }}
                  />
                )}
              />
              {errors.entity && <p className="small text-danger mt-1">Entity is required.</p>}
            </div>

            <div className="mb-1">
              <Label className="form-label" for="start_date">
                Start Date
              </Label>
              <Controller
                control={control}
                name="start"
                rules={{ required: true }}
                render={({ field: { onChange, ...fieldProps } }) => (
                  <Flatpickr
                    {...fieldProps}
                    className={`form-control ${classnames({ 'is-invalid': errors.start })}`}
                    onChange={(date, currentdateString) => {
                      setStartPicker(date);
                      onChange(currentdateString);
                    }}
                    options={{
                      enableTime: true,
                      dateFormat: 'Y-m-d H:i'
                    }}
                  />
                )}
              />
              {errors.start && <small className="text-danger mt-1">Start Date is required</small>}
            </div>
            <div className="mb-1">
              <Label className="form-label" for="end">
                End Date
              </Label>
              <Controller
                control={control}
                name="end"
                rules={{ required: true }}
                render={({ field: { onChange, ...fieldProps } }) => (
                  <Flatpickr
                    {...fieldProps}
                    className={`form-control ${classnames({ 'is-invalid': errors.end })}`}
                    onChange={(date, currentdateString) => {
                      setEndPicker(date);
                      onChange(currentdateString);
                    }}
                    options={{
                      enableTime: true,
                      dateFormat: 'Y-m-d H:i'
                    }}
                  />
                )}
              />
              {errors.end && <small className="text-danger mt-1">End Date is required</small>}
            </div>

            <div className="mb-1">
              <Label className="form-label" for="description">
                Description
              </Label>
              <textarea
                className={`form-control ${classnames({ 'is-invalid': errors.title })}`}
                type="text"
                id="description"
                placeholder="Description"
                rows={5}
                {...register('description', { required: true })}></textarea>
              {errors.description && <span className="small text-danger">Description is required.</span>}
            </div>
            <div className="d-flex mb-1">
              <EventActions />
            </div>
          </Form>
        </ModalBody>
      </PerfectScrollbar>
    </Modal>
  );
};

export default AddEditEventSidebar;
