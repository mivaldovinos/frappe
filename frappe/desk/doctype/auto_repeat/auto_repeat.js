// Copyright (c) 2018, Frappe Technologies and contributors
// For license information, please see license.txt
frappe.provide("frappe.auto_repeat");

frappe.ui.form.on('Auto Repeat', {
	setup: function(frm) {
		frm.fields_dict['reference_doctype'].get_query = function() {
			return {
				query: "frappe.desk.doctype.auto_repeat.auto_repeat.auto_repeat_doctype_query"
			};
		};

		frm.fields_dict['reference_document'].get_query = function() {
			return {
				filters: {
					"docstatus": 1,
					"auto_repeat": ''
				}
			};
		};

		frm.fields_dict['print_format'].get_query = function() {
			return {
				filters: {
					"doc_type": frm.doc.reference_doctype
				}
			};
		};
	},

	refresh: function(frm) {
		
		if(frm.doc.docstatus == 1) {
			
			let label = __('View {0}', [frm.doc.reference_doctype]);
			frm.add_custom_button(__(label),
				function() {
					frappe.route_options = {
						"auto_repeat": frm.doc.name,
					};
					frappe.set_route("List", frm.doc.reference_doctype);
				}
			);

			if(frm.doc.status != 'Stopped') {
				frm.add_custom_button(__("Stop"),
					function() {
						frm.events.stop_resume_auto_repeat(frm, "Stopped");
					}
				);
			}

			if(frm.doc.status == 'Stopped') {
				frm.add_custom_button(__("Resume"),
					function() {
						frm.events.stop_resume_auto_repeat(frm, "Resumed");
					}
				);
			}

			if(frm.doc.status!= 0){
				frappe.auto_repeat.render_schedule(frm);
			}
		}
		
	},

	stop_resume_auto_repeat: function(frm, status) {
		frappe.call({
			method: "frappe.desk.doctype.auto_repeat.auto_repeat.stop_resume_auto_repeat",
			args: {
				auto_repeat: frm.doc.name,
				status: status
			},
			callback: function(r) {
				if(r.message) {
					frm.set_value("status", r.message);
					frm.reload_doc();
				}
			}
		});
	}
});

frappe.auto_repeat.render_schedule = function(frm) { 
	frappe.call({
		method: "get_auto_repeat_schedule",
		doc: frm.doc
	}).done((r) => {
		var wrapper = $(frm.fields_dict["auto_repeat_schedule"].wrapper);

		wrapper.html(frappe.render_template ("auto_repeat_schedule", {"schedule_details" : r.message || []}  ));
	});
	frm.refresh_fields() ;
};